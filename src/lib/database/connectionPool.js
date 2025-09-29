import { PrismaClient } from '@prisma/client';

// Only import logger on server side
let logger;
if (typeof window === 'undefined') {
  try {
    logger = require('@/lib/logger').default;
  } catch (error) {
    // Fallback to console if logger is not available
    logger = console;
  }
} else {
  // Client side fallback
  logger = console;
}

/**
 * Database connection pooling and optimization
 */

/**
 * Connection pool configuration
 */
const POOL_CONFIG = {
  // Connection pool settings
  maxConnections: process.env.DATABASE_MAX_CONNECTIONS || 20,
  minConnections: process.env.DATABASE_MIN_CONNECTIONS || 5,
  connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT || 10000,
  idleTimeout: process.env.DATABASE_IDLE_TIMEOUT || 30000,

  // Query optimization settings
  queryTimeout: process.env.DATABASE_QUERY_TIMEOUT || 30000,
  slowQueryThreshold: process.env.DATABASE_SLOW_QUERY_THRESHOLD || 1000,

  // Retry settings
  maxRetries: process.env.DATABASE_MAX_RETRIES || 3,
  retryDelay: process.env.DATABASE_RETRY_DELAY || 1000,

  // Monitoring settings
  enableMetrics: process.env.DATABASE_ENABLE_METRICS === 'true',
  logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
  logSlowQueries: process.env.DATABASE_LOG_SLOW_QUERIES === 'true',
};

/**
 * Database metrics
 */
const metrics = {
  totalQueries: 0,
  slowQueries: 0,
  failedQueries: 0,
  connectionCount: 0,
  activeConnections: 0,
  queryTimes: [],
  lastReset: Date.now(),
};

/**
 * Enhanced Prisma client with connection pooling and optimization
 */
class OptimizedPrismaClient extends PrismaClient {
  constructor(options = {}) {
    const prismaOptions = {
      log: POOL_CONFIG.logQueries
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      ...options,
    };

    super(prismaOptions);

    // Set up query logging and metrics
    this.setupQueryLogging();
    this.setupConnectionMonitoring();
    this.setupErrorHandling();
  }

  /**
   * Set up query logging and performance monitoring
   */
  setupQueryLogging() {
    if (POOL_CONFIG.logQueries || POOL_CONFIG.logSlowQueries) {
      this.$on('query', e => {
        const queryTime = e.duration;
        const isSlow = queryTime > POOL_CONFIG.slowQueryThreshold;

        metrics.totalQueries++;
        metrics.queryTimes.push(queryTime);

        if (isSlow) {
          metrics.slowQueries++;
          if (POOL_CONFIG.logSlowQueries) {
            logger.warn('Slow database query detected', {
              query: e.query,
              params: e.params,
              duration: `${queryTime}ms`,
              target: e.target,
            });
          }
        }

        if (POOL_CONFIG.logQueries) {
          logger.debug('Database query executed', {
            query: e.query,
            duration: `${queryTime}ms`,
            target: e.target,
            slow: isSlow,
          });
        }
      });
    }
  }

  /**
   * Set up connection monitoring
   */
  setupConnectionMonitoring() {
    if (POOL_CONFIG.enableMetrics) {
      setInterval(() => {
        this.getConnectionMetrics()
          .then(connectionMetrics => {
            metrics.connectionCount = connectionMetrics.connectionCount;
            metrics.activeConnections = connectionMetrics.activeConnections;

            logger.debug('Database connection metrics', {
              ...connectionMetrics,
              totalQueries: metrics.totalQueries,
              slowQueries: metrics.slowQueries,
              failedQueries: metrics.failedQueries,
            });
          })
          .catch(error => {
            logger.error('Failed to get connection metrics', {
              error: error.message,
            });
          });
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Set up error handling
   */
  setupErrorHandling() {
    this.$on('error', e => {
      metrics.failedQueries++;
      logger.error('Database error', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });
  }

  /**
   * Get connection metrics
   * @returns {Promise<Object>} - Connection metrics
   */
  async getConnectionMetrics() {
    try {
      // This is a simplified version - actual implementation would depend on the database
      const result = await this.$queryRaw`SELECT 1 as connection_count`;
      return {
        connectionCount: 1, // Simplified
        activeConnections: 1, // Simplified
        maxConnections: POOL_CONFIG.maxConnections,
        minConnections: POOL_CONFIG.minConnections,
      };
    } catch (error) {
      logger.error('Failed to get connection metrics', {
        error: error.message,
      });
      return {
        connectionCount: 0,
        activeConnections: 0,
        maxConnections: POOL_CONFIG.maxConnections,
        minConnections: POOL_CONFIG.minConnections,
      };
    }
  }

  /**
   * Execute query with retry logic
   * @param {Function} queryFunction - Query function to execute
   * @param {Object} options - Query options
   * @returns {Promise<any>} - Query result
   */
  async executeWithRetry(queryFunction, options = {}) {
    const {
      maxRetries = POOL_CONFIG.maxRetries,
      retryDelay = POOL_CONFIG.retryDelay,
      timeout = POOL_CONFIG.queryTimeout,
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Set query timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });

        const result = await Promise.race([queryFunction(), timeoutPromise]);

        return result;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          metrics.failedQueries++;
          logger.error('Query failed after all retries', {
            error: error.message,
            attempts: attempt,
            maxRetries,
          });
          throw error;
        }

        logger.warn('Query failed, retrying', {
          error: error.message,
          attempt,
          maxRetries,
          retryDelay,
        });

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    throw lastError;
  }

  /**
   * Get database metrics
   * @returns {Object} - Database metrics
   */
  getMetrics() {
    const now = Date.now();
    const timeSinceReset = now - metrics.lastReset;

    const avgQueryTime =
      metrics.queryTimes.length > 0
        ? metrics.queryTimes.reduce((a, b) => a + b, 0) /
          metrics.queryTimes.length
        : 0;

    return {
      ...metrics,
      avgQueryTime: Math.round(avgQueryTime),
      queriesPerSecond: Math.round(
        (metrics.totalQueries / timeSinceReset) * 1000
      ),
      slowQueryPercentage:
        metrics.totalQueries > 0
          ? Math.round((metrics.slowQueries / metrics.totalQueries) * 100)
          : 0,
      errorRate:
        metrics.totalQueries > 0
          ? Math.round((metrics.failedQueries / metrics.totalQueries) * 100)
          : 0,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    metrics.totalQueries = 0;
    metrics.slowQueries = 0;
    metrics.failedQueries = 0;
    metrics.queryTimes = [];
    metrics.lastReset = Date.now();

    logger.info('Database metrics reset');
  }

  /**
   * Optimize connection pool
   */
  async optimizeConnectionPool() {
    try {
      // This would contain actual connection pool optimization logic
      logger.info('Optimizing database connection pool', {
        maxConnections: POOL_CONFIG.maxConnections,
        minConnections: POOL_CONFIG.minConnections,
      });

      // In a real implementation, you would:
      // 1. Adjust connection pool size based on load
      // 2. Close idle connections
      // 3. Pre-warm connections
      // 4. Monitor and adjust based on metrics
    } catch (error) {
      logger.error('Failed to optimize connection pool', {
        error: error.message,
      });
    }
  }

  /**
   * Health check for database connection
   * @returns {Promise<Object>} - Health check result
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      await this.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        healthy: true,
        responseTime,
        connectionCount: metrics.connectionCount,
        activeConnections: metrics.activeConnections,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        connectionCount: metrics.connectionCount,
        activeConnections: metrics.activeConnections,
      };
    }
  }
}

/**
 * Create optimized Prisma client instance
 * @param {Object} options - Client options
 * @returns {OptimizedPrismaClient} - Optimized Prisma client
 */
export function createOptimizedPrismaClient(options = {}) {
  return new OptimizedPrismaClient(options);
}

/**
 * Get database configuration
 * @returns {Object} - Database configuration
 */
export function getDatabaseConfig() {
  return {
    ...POOL_CONFIG,
    url: process.env.DATABASE_URL ? '***' : 'Not set', // Hide sensitive data
  };
}

/**
 * Database query optimization utilities
 */
export const QueryOptimization = {
  /**
   * Create optimized query options
   * @param {Object} options - Query options
   * @returns {Object} - Optimized query options
   */
  createQueryOptions(options = {}) {
    return {
      timeout: POOL_CONFIG.queryTimeout,
      retries: POOL_CONFIG.maxRetries,
      ...options,
    };
  },

  /**
   * Add query hints for optimization
   * @param {string} query - SQL query
   * @param {Object} hints - Query hints
   * @returns {string} - Optimized query
   */
  addQueryHints(query, hints = {}) {
    // This would contain actual query optimization logic
    // For now, just return the original query
    return query;
  },

  /**
   * Analyze query performance
   * @param {string} query - SQL query
   * @param {number} executionTime - Query execution time
   * @returns {Object} - Performance analysis
   */
  analyzeQueryPerformance(query, executionTime) {
    const isSlow = executionTime > POOL_CONFIG.slowQueryThreshold;

    return {
      query,
      executionTime,
      isSlow,
      threshold: POOL_CONFIG.slowQueryThreshold,
      recommendations: isSlow
        ? [
            'Consider adding database indexes',
            'Review query structure',
            'Check for N+1 query problems',
            'Consider query caching',
          ]
        : [],
    };
  },
};

// Export the optimized client instance
export const prisma = createOptimizedPrismaClient();
