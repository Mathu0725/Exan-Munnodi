import { NextResponse } from 'next/server';
import { redisRateLimiter } from './redisRateLimiter.js';
import { HTTP_STATUS } from '@/lib/http/statusCodes.js';
import logger from '@/lib/logger/index.js';

/**
 * Redis-based rate limiting middleware for Next.js
 */

/**
 * Rate limiting configuration for different endpoint types
 */
const ENDPOINT_CONFIGS = {
  // Authentication endpoints - strict limits
  auth: {
    tier: 'auth',
    type: 'ip',
    strategy: 'sliding_window',
  },

  // API endpoints - moderate limits
  api: {
    tier: 'api',
    type: 'ip',
    strategy: 'sliding_window',
  },

  // User-specific endpoints - higher limits for authenticated users
  user: {
    tier: 'user',
    type: 'user',
    strategy: 'sliding_window',
  },

  // Admin endpoints - very high limits
  admin: {
    tier: 'admin',
    type: 'user',
    strategy: 'sliding_window',
  },

  // Public endpoints - basic limits
  public: {
    tier: 'api',
    type: 'ip',
    strategy: 'sliding_window',
  },
};

/**
 * Extract user ID from request
 * @param {Request} request - The request object
 * @returns {string|null} - User ID or null
 */
function extractUserId(request) {
  try {
    // Try to get user ID from JWT token in cookies
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const authTokenMatch = cookies.match(/auth_token=([^;]+)/);
      if (authTokenMatch) {
        const token = authTokenMatch[1];
        // In a real implementation, you would decode the JWT to get the user ID
        // For now, we'll use a placeholder
        return `user_${token.substring(0, 8)}`;
      }
    }

    // Try to get user ID from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return `user_${token.substring(0, 8)}`;
    }

    return null;
  } catch (error) {
    logger.error('Failed to extract user ID', { error: error.message });
    return null;
  }
}

/**
 * Extract IP address from request
 * @param {Request} request - The request object
 * @returns {string} - IP address
 */
function extractIpAddress(request) {
  // Check for forwarded IP (from load balancer/proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to connection remote address
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Default fallback
  return '127.0.0.1';
}

/**
 * Determine endpoint type from URL path
 * @param {string} pathname - URL pathname
 * @returns {string} - Endpoint type
 */
function getEndpointType(pathname) {
  if (pathname.startsWith('/api/auth/')) return 'auth';
  if (pathname.startsWith('/api/admin/')) return 'admin';
  if (pathname.startsWith('/api/user/')) return 'user';
  if (pathname.startsWith('/api/')) return 'api';
  return 'public';
}

/**
 * Create rate limit error response
 * @param {Object} rateLimitResult - Rate limit result
 * @param {string} endpointType - Endpoint type
 * @returns {NextResponse} - Error response
 */
function createRateLimitErrorResponse(rateLimitResult, endpointType) {
  const { retryAfter, remaining, resetTime } = rateLimitResult;

  const message =
    endpointType === 'auth'
      ? 'Too many authentication attempts. Please try again later.'
      : 'Too many requests. Please try again later.';

  const response = NextResponse.json(
    {
      success: false,
      error: message,
      type: 'rate_limit_error',
      retryAfter,
      remaining,
      resetTime: new Date(resetTime).toISOString(),
    },
    {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '0',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        'X-RateLimit-Type': endpointType,
      },
    }
  );

  return response;
}

/**
 * Create rate limiting middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Rate limiting middleware
 */
export function createRateLimitingMiddleware(options = {}) {
  const {
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = null,
    onLimitReached = null,
    skipPaths = [],
    skipMethods = ['OPTIONS'],
  } = options;

  return async (request, next) => {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Skip if path is in skip list
    if (skipPaths.some(path => pathname.startsWith(path))) {
      return next(request);
    }

    // Skip if method is in skip list
    if (skipMethods.includes(method)) {
      return next(request);
    }

    // Determine endpoint type
    const endpointType = getEndpointType(pathname);
    const config = ENDPOINT_CONFIGS[endpointType];

    if (!config) {
      return next(request);
    }

    // Extract identifier based on type
    let identifier;
    if (config.type === 'user') {
      identifier = extractUserId(request);
      if (!identifier) {
        // Fallback to IP if no user ID
        identifier = extractIpAddress(request);
        config.type = 'ip';
      }
    } else {
      identifier = extractIpAddress(request);
    }

    // Use custom key generator if provided
    if (keyGenerator) {
      identifier = keyGenerator(request, config);
    }

    try {
      // Check rate limit
      const rateLimitResult = await redisRateLimiter.checkLimit(identifier, {
        type: config.type,
        tier: config.tier,
        strategy: config.strategy,
      });

      // Add rate limit headers to response
      const response = await next(request);

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimitResult.limit?.toString() || '0'
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime / 1000).toString()
      );
      response.headers.set('X-RateLimit-Type', endpointType);

      // Check if request should be blocked
      if (!rateLimitResult.allowed) {
        // Call custom handler if provided
        if (onLimitReached) {
          onLimitReached(request, rateLimitResult);
        }

        return createRateLimitErrorResponse(rateLimitResult, endpointType);
      }

      // Log rate limit status
      logger.debug('Rate limit check passed', {
        identifier,
        type: config.type,
        tier: config.tier,
        remaining: rateLimitResult.remaining,
        endpoint: pathname,
        method,
      });

      return response;
    } catch (error) {
      logger.error('Rate limiting middleware error', {
        error: error.message,
        identifier,
        endpoint: pathname,
        method,
      });

      // Continue without rate limiting on error
      return next(request);
    }
  };
}

/**
 * Create user-specific rate limiting middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - User rate limiting middleware
 */
export function createUserRateLimitingMiddleware(options = {}) {
  const {
    tier = 'user',
    strategy = 'sliding_window',
    maxRequests = 200,
    windowMs = 60 * 1000, // 1 minute
  } = options;

  return async (request, next) => {
    const userId = extractUserId(request);

    if (!userId) {
      // No user ID, skip rate limiting
      return next(request);
    }

    try {
      const rateLimitResult = await redisRateLimiter.checkLimit(userId, {
        type: 'user',
        tier,
        strategy,
        customConfig: {
          maxRequests,
          windowMs,
          strategy,
        },
      });

      if (!rateLimitResult.allowed) {
        return createRateLimitErrorResponse(rateLimitResult, 'user');
      }

      const response = await next(request);

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimitResult.limit?.toString() || '0'
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime / 1000).toString()
      );
      response.headers.set('X-RateLimit-Type', 'user');

      return response;
    } catch (error) {
      logger.error('User rate limiting middleware error', {
        error: error.message,
        userId,
      });

      return next(request);
    }
  };
}

/**
 * Create IP-based rate limiting middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - IP rate limiting middleware
 */
export function createIpRateLimitingMiddleware(options = {}) {
  const {
    tier = 'api',
    strategy = 'sliding_window',
    maxRequests = 60,
    windowMs = 60 * 1000, // 1 minute
  } = options;

  return async (request, next) => {
    const ipAddress = extractIpAddress(request);

    try {
      const rateLimitResult = await redisRateLimiter.checkLimit(ipAddress, {
        type: 'ip',
        tier,
        strategy,
        customConfig: {
          maxRequests,
          windowMs,
          strategy,
        },
      });

      if (!rateLimitResult.allowed) {
        return createRateLimitErrorResponse(rateLimitResult, 'ip');
      }

      const response = await next(request);

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimitResult.limit?.toString() || '0'
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime / 1000).toString()
      );
      response.headers.set('X-RateLimit-Type', 'ip');

      return response;
    } catch (error) {
      logger.error('IP rate limiting middleware error', {
        error: error.message,
        ipAddress,
      });

      return next(request);
    }
  };
}

/**
 * Rate limiting utilities
 */
export const RateLimitingUtils = {
  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Reset options
   * @returns {Promise<boolean>} - Whether reset was successful
   */
  async resetLimit(identifier, options = {}) {
    return await redisRateLimiter.resetLimit(identifier, options);
  },

  /**
   * Get rate limit status
   * @param {string} identifier - Rate limit identifier
   * @param {Object} options - Status options
   * @returns {Promise<Object>} - Rate limit status
   */
  async getStatus(identifier, options = {}) {
    return await redisRateLimiter.getStatus(identifier, options);
  },

  /**
   * Get rate limiter statistics
   * @returns {Promise<Object>} - Rate limiter statistics
   */
  async getStats() {
    return await redisRateLimiter.getStats();
  },

  /**
   * Check if rate limiter is available
   * @returns {boolean} - Whether rate limiter is available
   */
  isAvailable() {
    return redisRateLimiter.isRedisAvailable();
  },
};
