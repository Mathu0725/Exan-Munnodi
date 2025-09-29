import logger from './index.js';

/**
 * Request logging middleware for Next.js API routes
 */

/**
 * Log incoming HTTP requests
 * @param {Request} request - The incoming request
 * @param {Object} context - Additional context
 */
export function logRequest(request, context = {}) {
  const url = new URL(request.url);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const method = request.method;
  const path = url.pathname;
  const query = url.search;

  logger.http('Incoming request', {
    method,
    path,
    query,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log outgoing HTTP responses
 * @param {Request} request - The original request
 * @param {Response} response - The outgoing response
 * @param {Object} context - Additional context
 */
export function logResponse(request, response, context = {}) {
  const url = new URL(request.url);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const method = request.method;
  const path = url.pathname;
  const statusCode = response.status;
  const responseTime = context.responseTime || 0;

  // Determine log level based on status code
  let level = 'info';
  if (statusCode >= 400 && statusCode < 500) {
    level = 'warn';
  } else if (statusCode >= 500) {
    level = 'error';
  }

  logger[level]('Outgoing response', {
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    ip,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log API errors
 * @param {Error} error - The error object
 * @param {Request} request - The request that caused the error
 * @param {Object} context - Additional context
 */
export function logError(error, request, context = {}) {
  const url = new URL(request.url);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  logger.error('API Error', {
    message: error.message,
    stack: error.stack,
    method: request.method,
    path: url.pathname,
    query: url.search,
    ip,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log authentication events
 * @param {string} event - The authentication event
 * @param {Object} data - Event data
 */
export function logAuthEvent(event, data = {}) {
  logger.info('Authentication Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Log security events
 * @param {string} event - The security event
 * @param {Object} data - Event data
 */
export function logSecurityEvent(event, data = {}) {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Log database operations
 * @param {string} operation - The database operation
 * @param {Object} data - Operation data
 */
export function logDatabaseOperation(operation, data = {}) {
  logger.debug('Database Operation', {
    operation,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Log business logic events
 * @param {string} event - The business event
 * @param {Object} data - Event data
 */
export function logBusinessEvent(event, data = {}) {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
}
