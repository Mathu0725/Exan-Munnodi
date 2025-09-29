import { NextResponse } from 'next/server';
import { logRequest, logResponse, logError } from '@/lib/logger/requestLogger';
import { HTTP_STATUS } from '@/lib/http/statusCodes';

/**
 * Request/Response logging middleware for Next.js API routes
 */

/**
 * Create request logging middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createRequestLoggerMiddleware(options = {}) {
  const {
    logRequestBody = false,
    logResponseBody = false,
    logHeaders = false,
    skipPaths = [],
    skipMethods = ['OPTIONS'],
    maxBodySize = 1024, // Max body size to log in bytes
  } = options;

  return async (request, next) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    // Skip logging for certain paths or methods
    if (
      skipPaths.some(path => url.pathname.startsWith(path)) ||
      skipMethods.includes(request.method)
    ) {
      return next();
    }

    // Prepare request context
    const requestContext = {
      method: request.method,
      path: url.pathname,
      query: url.search,
      ip:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
    };

    // Add headers if requested
    if (logHeaders) {
      requestContext.headers = Object.fromEntries(request.headers.entries());
    }

    // Add request body if requested and method allows it
    if (logRequestBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const body = await request.clone().text();
          if (body.length <= maxBodySize) {
            requestContext.body = JSON.parse(body);
          } else {
            requestContext.body = `[Body too large: ${body.length} bytes]`;
          }
        }
      } catch (error) {
        requestContext.bodyError = 'Failed to parse request body';
      }
    }

    // Log incoming request
    logRequest(request, requestContext);

    try {
      // Execute the next middleware/handler
      const response = await next();

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Prepare response context
      const responseContext = {
        responseTime,
        statusCode: response.status,
      };

      // Add response body if requested
      if (logResponseBody && response.body) {
        try {
          const responseText = await response.clone().text();
          if (responseText.length <= maxBodySize) {
            responseContext.body = JSON.parse(responseText);
          } else {
            responseContext.body = `[Response too large: ${responseText.length} bytes]`;
          }
        } catch (error) {
          responseContext.bodyError = 'Failed to parse response body';
        }
      }

      // Log outgoing response
      logResponse(request, response, responseContext);

      return response;
    } catch (error) {
      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Log error
      logError(error, request, {
        responseTime,
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Performance monitoring middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createPerformanceMiddleware(options = {}) {
  const {
    slowRequestThreshold = 1000, // 1 second
    logSlowRequests = true,
  } = options;

  return async (request, next) => {
    const startTime = Date.now();

    try {
      const response = await next();
      const responseTime = Date.now() - startTime;

      // Log slow requests
      if (logSlowRequests && responseTime > slowRequestThreshold) {
        const url = new URL(request.url);
        console.warn(
          `Slow request detected: ${request.method} ${url.pathname} took ${responseTime}ms`
        );
      }

      // Add performance headers
      response.headers.set('X-Response-Time', `${responseTime}ms`);
      response.headers.set('X-Process-Time', `${Date.now() - startTime}ms`);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log slow errors
      if (logSlowRequests && responseTime > slowRequestThreshold) {
        const url = new URL(request.url);
        console.warn(
          `Slow error response: ${request.method} ${url.pathname} took ${responseTime}ms`
        );
      }

      throw error;
    }
  };
}

/**
 * Request ID middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createRequestIdMiddleware(options = {}) {
  const {
    headerName = 'X-Request-ID',
    generateId = () => crypto.randomUUID(),
  } = options;

  return async (request, next) => {
    // Get or generate request ID
    let requestId = request.headers.get(headerName.toLowerCase());
    if (!requestId) {
      requestId = generateId();
    }

    // Add request ID to response headers
    const response = await next();
    response.headers.set(headerName, requestId);

    return response;
  };
}

/**
 * Security logging middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createSecurityLoggingMiddleware(options = {}) {
  const {
    logSuspiciousActivity = true,
    suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /javascript:/i, // JavaScript protocol
    ],
  } = options;

  return async (request, next) => {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Check for suspicious patterns
    if (logSuspiciousActivity) {
      const suspiciousActivity = [];

      // Check URL path
      if (suspiciousPatterns.some(pattern => pattern.test(url.pathname))) {
        suspiciousActivity.push('Suspicious path pattern');
      }

      // Check query parameters
      if (suspiciousPatterns.some(pattern => pattern.test(url.search))) {
        suspiciousActivity.push('Suspicious query pattern');
      }

      // Check user agent
      if (userAgent.length > 500) {
        suspiciousActivity.push('Suspicious user agent length');
      }

      // Log suspicious activity
      if (suspiciousActivity.length > 0) {
        console.warn('Suspicious activity detected', {
          ip,
          userAgent,
          path: url.pathname,
          query: url.search,
          activities: suspiciousActivity,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return next();
  };
}

/**
 * Combined logging middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Combined middleware function
 */
export function createCombinedLoggingMiddleware(options = {}) {
  const requestLogger = createRequestLoggerMiddleware(
    options.requestLogger || {}
  );
  const performanceLogger = createPerformanceMiddleware(
    options.performance || {}
  );
  const requestIdLogger = createRequestIdMiddleware(options.requestId || {});
  const securityLogger = createSecurityLoggingMiddleware(
    options.security || {}
  );

  return async (request, next) => {
    // Apply all middleware in sequence
    return requestLogger(request, async () => {
      return performanceLogger(request, async () => {
        return requestIdLogger(request, async () => {
          return securityLogger(request, next);
        });
      });
    });
  };
}

/**
 * Simple request logger for basic logging
 * @param {Request} request - The request object
 * @param {Response} response - The response object
 * @param {number} responseTime - Response time in milliseconds
 */
export function logBasicRequest(request, response, responseTime) {
  const url = new URL(request.url);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = request.headers.get('user-agent') || 'Unknown';

  console.log(
    `${request.method} ${url.pathname} ${response.status} ${responseTime}ms - ${ip} - ${userAgent}`
  );
}
