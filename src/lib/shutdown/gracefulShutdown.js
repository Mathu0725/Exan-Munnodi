import logger from '@/lib/logger';
import prisma from '@/lib/prisma';

/**
 * Graceful shutdown system for clean application termination
 */

/**
 * Shutdown signal types
 */
export const SHUTDOWN_SIGNALS = {
  SIGTERM: 'SIGTERM',
  SIGINT: 'SIGINT',
  SIGUSR2: 'SIGUSR2', // Used by nodemon
  uncaughtException: 'uncaughtException',
  unhandledRejection: 'unhandledRejection',
};

/**
 * Shutdown configuration
 */
const SHUTDOWN_CONFIG = {
  timeout: 30000, // 30 seconds timeout
  forceExit: true, // Force exit if graceful shutdown fails
};

/**
 * Shutdown state
 */
let isShuttingDown = false;
let shutdownStartTime = null;

/**
 * Shutdown handlers registry
 */
const shutdownHandlers = new Map();

/**
 * Register a shutdown handler
 * @param {string} name - Handler name
 * @param {Function} handler - Handler function
 * @param {Object} options - Handler options
 */
export function registerShutdownHandler(name, handler, options = {}) {
  const {
    priority = 0, // Higher priority runs first
    timeout = 5000, // 5 seconds timeout for this handler
    critical = false, // Critical handlers must complete for graceful shutdown
  } = options;

  shutdownHandlers.set(name, {
    handler,
    priority,
    timeout,
    critical,
    completed: false,
  });

  logger.info(`Registered shutdown handler: ${name}`, {
    priority,
    timeout,
    critical,
  });
}

/**
 * Unregister a shutdown handler
 * @param {string} name - Handler name
 */
export function unregisterShutdownHandler(name) {
  shutdownHandlers.delete(name);
  logger.info(`Unregistered shutdown handler: ${name}`);
}

/**
 * Execute shutdown handlers
 * @param {string} signal - Shutdown signal
 * @returns {Promise<boolean>} - Whether all critical handlers completed
 */
async function executeShutdownHandlers(signal) {
  const handlers = Array.from(shutdownHandlers.entries()).sort(
    ([, a], [, b]) => b.priority - a.priority
  );

  logger.info(`Executing ${handlers.length} shutdown handlers`, { signal });

  const results = await Promise.allSettled(
    handlers.map(async ([name, config]) => {
      const startTime = Date.now();

      try {
        logger.info(`Executing shutdown handler: ${name}`);

        // Set timeout for individual handler
        const handlerPromise = config.handler(signal);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Handler ${name} timed out`)),
            config.timeout
          );
        });

        await Promise.race([handlerPromise, timeoutPromise]);

        const duration = Date.now() - startTime;
        config.completed = true;

        logger.info(`Shutdown handler completed: ${name}`, {
          duration: `${duration}ms`,
        });
        return { name, success: true, duration };
      } catch (error) {
        const duration = Date.now() - startTime;
        config.completed = false;

        logger.error(`Shutdown handler failed: ${name}`, {
          error: error.message,
          duration: `${duration}ms`,
        });

        return { name, success: false, error: error.message, duration };
      }
    })
  );

  // Check if all critical handlers completed
  const criticalHandlers = handlers.filter(([, config]) => config.critical);
  const criticalResults = results.filter(
    (result, index) =>
      criticalHandlers[index] &&
      result.status === 'fulfilled' &&
      result.value.success
  );

  const allCriticalCompleted =
    criticalResults.length === criticalHandlers.length;

  logger.info('Shutdown handlers execution completed', {
    total: handlers.length,
    successful: results.filter(r => r.status === 'fulfilled' && r.value.success)
      .length,
    failed: results.filter(r => r.status === 'rejected' || !r.value.success)
      .length,
    criticalCompleted: allCriticalCompleted,
  });

  return allCriticalCompleted;
}

/**
 * Graceful shutdown function
 * @param {string} signal - Shutdown signal
 * @param {number} code - Exit code
 */
async function gracefulShutdown(signal, code = 0) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  shutdownStartTime = Date.now();

  logger.info('Initiating graceful shutdown', { signal, code });

  try {
    // Execute shutdown handlers
    const criticalHandlersCompleted = await executeShutdownHandlers(signal);

    const shutdownDuration = Date.now() - shutdownStartTime;

    if (criticalHandlersCompleted) {
      logger.info('Graceful shutdown completed successfully', {
        duration: `${shutdownDuration}ms`,
        signal,
      });
      process.exit(code);
    } else {
      logger.error('Critical shutdown handlers failed, forcing exit', {
        duration: `${shutdownDuration}ms`,
        signal,
      });
      process.exit(1);
    }
  } catch (error) {
    logger.error('Graceful shutdown failed', {
      error: error.message,
      signal,
    });
    process.exit(1);
  }
}

/**
 * Force shutdown after timeout
 */
function forceShutdown() {
  if (!isShuttingDown) return;

  const shutdownDuration = Date.now() - shutdownStartTime;

  logger.error('Graceful shutdown timeout exceeded, forcing exit', {
    duration: `${shutdownDuration}ms`,
    timeout: SHUTDOWN_CONFIG.timeout,
  });

  process.exit(1);
}

/**
 * Initialize graceful shutdown handlers
 */
export function initializeGracefulShutdown() {
  // Register default shutdown handlers
  registerShutdownHandler(
    'database',
    async signal => {
      logger.info('Closing database connection');
      await prisma.$disconnect();
    },
    { priority: 100, critical: true }
  );

  registerShutdownHandler(
    'logger',
    async signal => {
      logger.info('Flushing logger buffers');
      // Winston will handle its own cleanup
    },
    { priority: 10 }
  );

  // Set up signal handlers
  const signals = [
    SHUTDOWN_SIGNALS.SIGTERM,
    SHUTDOWN_SIGNALS.SIGINT,
    SHUTDOWN_SIGNALS.SIGUSR2,
  ];

  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`Received ${signal}, initiating graceful shutdown`);
      gracefulShutdown(signal);
    });
  });

  // Handle uncaught exceptions
  process.on(SHUTDOWN_SIGNALS.uncaughtException, error => {
    logger.error('Uncaught exception, initiating graceful shutdown', {
      error: error.message,
    });
    gracefulShutdown(SHUTDOWN_SIGNALS.uncaughtException, 1);
  });

  // Handle unhandled promise rejections
  process.on(SHUTDOWN_SIGNALS.unhandledRejection, (reason, promise) => {
    logger.error('Unhandled promise rejection, initiating graceful shutdown', {
      reason: reason?.message || reason,
      promise: promise.toString(),
    });
    gracefulShutdown(SHUTDOWN_SIGNALS.unhandledRejection, 1);
  });

  // Set up timeout for graceful shutdown
  process.on('beforeExit', () => {
    if (isShuttingDown) {
      setTimeout(forceShutdown, SHUTDOWN_CONFIG.timeout);
    }
  });

  logger.info('Graceful shutdown system initialized', {
    timeout: SHUTDOWN_CONFIG.timeout,
    forceExit: SHUTDOWN_CONFIG.forceExit,
  });
}

/**
 * Check if application is shutting down
 * @returns {boolean} - Whether shutdown is in progress
 */
export function isShuttingDownNow() {
  return isShuttingDown;
}

/**
 * Get detailed shutdown status
 * @returns {Object} - Shutdown status information
 */
export function getShutdownStatus() {
  return {
    isShuttingDown,
    shutdownStartTime,
    duration: shutdownStartTime ? Date.now() - shutdownStartTime : 0,
    handlersCount: shutdownHandlers.size,
    handlers: Array.from(shutdownHandlers.entries()).map(([name, config]) => ({
      name,
      priority: config.priority,
      timeout: config.timeout,
      critical: config.critical,
      completed: config.completed,
    })),
  };
}

/**
 * Manual shutdown trigger
 * @param {string} reason - Shutdown reason
 * @param {number} code - Exit code
 */
export function triggerShutdown(reason = 'Manual shutdown', code = 0) {
  logger.info('Manual shutdown triggered', { reason });
  gracefulShutdown('MANUAL', code);
}
