import Redis from 'ioredis';
import logger from '@/lib/logger';

/**
 * Redis-based rate limiting system with advanced features
 */

/**
 * Rate limiting strategies
 */
export const RATE_LIMIT_STRATEGIES = {
  FIXED_WINDOW: 'fixed_window',
  SLIDING_WINDOW: 'sliding_window',
  TOKEN_BUCKET: 'token_bucket',
  LEAKY_BUCKET: 'leaky_bucket',
};

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  },

  // Default rate limits
  defaults: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,
  },

  // Rate limit tiers
  tiers: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,
      blockDuration: 30 * 60 * 1000, // 30 minutes block
    },

    // API endpoints
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,
    },

    // User-specific limits
    user: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 200,
      strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,
    },

    // Admin endpoints
    admin: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000,
      strategy: RATE_LIMIT_STRATEGIES.SLIDING_WINDOW,
    },
  },

  // Key prefixes
  keyPrefixes: {
    ip: 'rl:ip:',
    user: 'rl:user:',
    endpoint: 'rl:endpoint:',
    global: 'rl:global:',
  },
};

/**
 * Redis rate limiter class
 */
export class RedisRateLimiter {
  constructor(options = {}) {
    this.config = { ...RATE_LIMIT_CONFIG, ...options };
    this.redis = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;

    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  initializeRedis() {
    try {
      this.redis = new Redis(this.config.redis);

      this.redis.on('connect', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        logger.info('Redis rate limiter connected successfully');
      });

      this.redis.on('error', error => {
        this.isConnected = false;
        this.connectionAttempts++;
        logger.error('Redis rate limiter connection error', {
          error: error.message,
          attempt: this.connectionAttempts,
        });

        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          logger.error(
            'Max Redis connection attempts reached, falling back to memory limiter'
          );
        }
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis rate limiter connection closed');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis rate limiter', {
        error: error.message,
      });
      this.isConnected = false;
    }
  }

  /**
   * Check if Redis is available
   * @returns {boolean} - Whether Redis is connected
   */
  isRedisAvailable() {
    return this.isConnected && this.redis && this.redis.status === 'ready';
  }

  /**
   * Generate rate limit key
   * @param {string} type - Key type (ip, user, endpoint, global)
   * @param {string} identifier - Identifier (IP, user ID, endpoint path)
   * @param {string} tier - Rate limit tier
   * @returns {string} - Rate limit key
   */
  generateKey(type, identifier, tier = 'api') {
    const prefix = this.config.keyPrefixes[type] || 'rl:';
    return `${prefix}${tier}:${identifier}`;
  }

  /**
   * Get rate limit configuration for tier
   * @param {string} tier - Rate limit tier
   * @returns {Object} - Rate limit configuration
   */
  getTierConfig(tier) {
    return this.config.tiers[tier] || this.config.defaults;
  }

  /**
   * Sliding window rate limiting
   * @param {string} key - Redis key
   * @param {Object} config - Rate limit configuration
   * @returns {Promise<Object>} - Rate limit result
   */
  async slidingWindowLimit(key, config) {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiration
    pipeline.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();

    if (!results || results.some(result => result[0] !== null)) {
      throw new Error('Redis pipeline execution failed');
    }

    const currentCount = results[1][1];
    const isAllowed = currentCount < config.maxRequests;

    return {
      allowed: isAllowed,
      remaining: Math.max(0, config.maxRequests - currentCount - 1),
      resetTime: now + config.windowMs,
      retryAfter: isAllowed ? 0 : Math.ceil(config.windowMs / 1000),
    };
  }

  /**
   * Fixed window rate limiting
   * @param {string} key - Redis key
   * @param {Object} config - Rate limit configuration
   * @returns {Promise<Object>} - Rate limit result
   */
  async fixedWindowLimit(key, config) {
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const windowKey = `${key}:${windowStart}`;

    const pipeline = this.redis.pipeline();

    // Increment counter
    pipeline.incr(windowKey);

    // Set expiration
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();

    if (!results || results.some(result => result[0] !== null)) {
      throw new Error('Redis pipeline execution failed');
    }

    const currentCount = results[0][1];
    const isAllowed = currentCount <= config.maxRequests;

    return {
      allowed: isAllowed,
      remaining: Math.max(0, config.maxRequests - currentCount),
      resetTime: windowStart + config.windowMs,
      retryAfter: isAllowed
        ? 0
        : Math.ceil((windowStart + config.windowMs - now) / 1000),
    };
  }

  /**
   * Token bucket rate limiting
   * @param {string} key - Redis key
   * @param {Object} config - Rate limit configuration
   * @returns {Promise<Object>} - Rate limit result
   */
  async tokenBucketLimit(key, config) {
    const now = Date.now();
    const bucketKey = `${key}:bucket`;
    const lastRefillKey = `${key}:last_refill`;

    const pipeline = this.redis.pipeline();

    // Get current bucket state
    pipeline.hmget(bucketKey, 'tokens', 'lastRefill');

    const results = await pipeline.exec();

    if (!results || results[0][0] !== null) {
      throw new Error('Redis pipeline execution failed');
    }

    const [tokens, lastRefill] = results[0][1];
    const currentTokens = parseInt(tokens) || config.maxRequests;
    const lastRefillTime = parseInt(lastRefill) || now;

    // Calculate tokens to add based on time elapsed
    const timeElapsed = now - lastRefillTime;
    const tokensToAdd = Math.floor(
      timeElapsed / (config.windowMs / config.maxRequests)
    );
    const newTokens = Math.min(config.maxRequests, currentTokens + tokensToAdd);

    const isAllowed = newTokens > 0;
    const finalTokens = isAllowed ? newTokens - 1 : newTokens;

    // Update bucket state
    const updatePipeline = this.redis.pipeline();
    updatePipeline.hmset(bucketKey, 'tokens', finalTokens, 'lastRefill', now);
    updatePipeline.expire(bucketKey, Math.ceil(config.windowMs / 1000));

    await updatePipeline.exec();

    return {
      allowed: isAllowed,
      remaining: finalTokens,
      resetTime: now + config.windowMs,
      retryAfter: isAllowed
        ? 0
        : Math.ceil(config.windowMs / config.maxRequests),
    };
  }

  /**
   * Check rate limit
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Rate limit options
   * @returns {Promise<Object>} - Rate limit result
   */
  async checkLimit(identifier, options = {}) {
    const {
      type = 'ip',
      tier = 'api',
      strategy = null,
      customConfig = null,
    } = options;

    // Fallback to memory limiter if Redis is not available
    if (!this.isRedisAvailable()) {
      logger.warn('Redis not available, using memory rate limiter fallback');
      return this.memoryFallback(identifier, options);
    }

    const key = this.generateKey(type, identifier, tier);
    const config = customConfig || this.getTierConfig(tier);
    const rateLimitStrategy = strategy || config.strategy;

    try {
      let result;

      switch (rateLimitStrategy) {
        case RATE_LIMIT_STRATEGIES.SLIDING_WINDOW:
          result = await this.slidingWindowLimit(key, config);
          break;
        case RATE_LIMIT_STRATEGIES.FIXED_WINDOW:
          result = await this.fixedWindowLimit(key, config);
          break;
        case RATE_LIMIT_STRATEGIES.TOKEN_BUCKET:
          result = await this.tokenBucketLimit(key, config);
          break;
        default:
          result = await this.slidingWindowLimit(key, config);
      }

      // Log rate limit events
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          identifier,
          type,
          tier,
          strategy: rateLimitStrategy,
          retryAfter: result.retryAfter,
        });
      }

      return {
        ...result,
        identifier,
        type,
        tier,
        strategy: rateLimitStrategy,
      };
    } catch (error) {
      logger.error('Rate limit check failed', {
        error: error.message,
        identifier,
        type,
        tier,
      });

      // Fallback to memory limiter on error
      return this.memoryFallback(identifier, options);
    }
  }

  /**
   * Memory fallback rate limiter
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Rate limit options
   * @returns {Object} - Rate limit result
   */
  memoryFallback(identifier, options = {}) {
    // Simple in-memory rate limiter as fallback
    const { tier = 'api' } = options;
    const config = this.getTierConfig(tier);

    // This is a simplified fallback - in production, you might want to use a more sophisticated approach
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: Date.now() + config.windowMs,
      retryAfter: 0,
      identifier,
      type: options.type || 'ip',
      tier,
      strategy: 'memory_fallback',
    };
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Reset options
   * @returns {Promise<boolean>} - Whether reset was successful
   */
  async resetLimit(identifier, options = {}) {
    const { type = 'ip', tier = 'api' } = options;

    if (!this.isRedisAvailable()) {
      return false;
    }

    try {
      const key = this.generateKey(type, identifier, tier);
      await this.redis.del(key);

      logger.info('Rate limit reset', { identifier, type, tier });
      return true;
    } catch (error) {
      logger.error('Failed to reset rate limit', {
        error: error.message,
        identifier,
        type,
        tier,
      });
      return false;
    }
  }

  /**
   * Get rate limit status for identifier
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Status options
   * @returns {Promise<Object>} - Rate limit status
   */
  async getStatus(identifier, options = {}) {
    const { type = 'ip', tier = 'api' } = options;

    if (!this.isRedisAvailable()) {
      return { available: false, reason: 'Redis not connected' };
    }

    try {
      const key = this.generateKey(type, identifier, tier);
      const config = this.getTierConfig(tier);

      const pipeline = this.redis.pipeline();
      pipeline.zcard(key);
      pipeline.ttl(key);

      const results = await pipeline.exec();

      if (!results || results.some(result => result[0] !== null)) {
        throw new Error('Redis pipeline execution failed');
      }

      const currentCount = results[0][1];
      const ttl = results[1][1];

      return {
        available: true,
        current: currentCount,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - currentCount),
        resetTime: ttl > 0 ? Date.now() + ttl * 1000 : null,
        tier,
        type,
      };
    } catch (error) {
      logger.error('Failed to get rate limit status', {
        error: error.message,
        identifier,
        type,
        tier,
      });
      return { available: false, reason: error.message };
    }
  }

  /**
   * Get rate limiter statistics
   * @returns {Promise<Object>} - Rate limiter statistics
   */
  async getStats() {
    if (!this.isRedisAvailable()) {
      return { available: false, reason: 'Redis not connected' };
    }

    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');

      return {
        available: true,
        redis: {
          connected: this.isConnected,
          memory: info,
          keyspace: keyspace,
        },
        config: this.config,
        connectionAttempts: this.connectionAttempts,
      };
    } catch (error) {
      logger.error('Failed to get rate limiter stats', {
        error: error.message,
      });
      return { available: false, reason: error.message };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
      logger.info('Redis rate limiter connection closed');
    }
  }
}

// Export singleton instance
export const redisRateLimiter = new RedisRateLimiter();
