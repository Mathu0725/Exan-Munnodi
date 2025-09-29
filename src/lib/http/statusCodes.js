/**
 * HTTP Status Codes utility
 * Standardized status codes for consistent API responses
 */

export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};

/**
 * Status code categories
 */
export const STATUS_CATEGORY = {
  SUCCESS: '2xx',
  REDIRECTION: '3xx',
  CLIENT_ERROR: '4xx',
  SERVER_ERROR: '5xx',
};

/**
 * Get status category for a status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Status category
 */
export function getStatusCategory(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return STATUS_CATEGORY.SUCCESS;
  if (statusCode >= 300 && statusCode < 400) return STATUS_CATEGORY.REDIRECTION;
  if (statusCode >= 400 && statusCode < 500)
    return STATUS_CATEGORY.CLIENT_ERROR;
  if (statusCode >= 500 && statusCode < 600)
    return STATUS_CATEGORY.SERVER_ERROR;
  return 'unknown';
}

/**
 * Check if status code indicates success
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} - Whether status indicates success
 */
export function isSuccessStatus(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Check if status code indicates client error
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} - Whether status indicates client error
 */
export function isClientErrorStatus(statusCode) {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if status code indicates server error
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} - Whether status indicates server error
 */
export function isServerErrorStatus(statusCode) {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Standard status code mappings for common scenarios
 */
export const STATUS_MAPPINGS = {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: HTTP_STATUS.UNAUTHORIZED,
  INVALID_CREDENTIALS: HTTP_STATUS.UNAUTHORIZED,
  TOKEN_EXPIRED: HTTP_STATUS.UNAUTHORIZED,
  INVALID_TOKEN: HTTP_STATUS.UNAUTHORIZED,
  INSUFFICIENT_PERMISSIONS: HTTP_STATUS.FORBIDDEN,
  ACCOUNT_LOCKED: HTTP_STATUS.FORBIDDEN,
  ACCOUNT_SUSPENDED: HTTP_STATUS.FORBIDDEN,

  // Validation & Input
  VALIDATION_ERROR: HTTP_STATUS.UNPROCESSABLE_ENTITY,
  MISSING_REQUIRED_FIELD: HTTP_STATUS.BAD_REQUEST,
  INVALID_FORMAT: HTTP_STATUS.BAD_REQUEST,
  INVALID_VALUE: HTTP_STATUS.BAD_REQUEST,
  DUPLICATE_ENTRY: HTTP_STATUS.CONFLICT,

  // Resources
  RESOURCE_NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  RESOURCE_ALREADY_EXISTS: HTTP_STATUS.CONFLICT,
  RESOURCE_CONFLICT: HTTP_STATUS.CONFLICT,
  RESOURCE_LOCKED: HTTP_STATUS.LOCKED,

  // Rate Limiting & Throttling
  RATE_LIMIT_EXCEEDED: HTTP_STATUS.TOO_MANY_REQUESTS,
  QUOTA_EXCEEDED: HTTP_STATUS.TOO_MANY_REQUESTS,

  // Server Issues
  INTERNAL_ERROR: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  SERVICE_UNAVAILABLE: HTTP_STATUS.SERVICE_UNAVAILABLE,
  DATABASE_ERROR: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  EXTERNAL_SERVICE_ERROR: HTTP_STATUS.BAD_GATEWAY,

  // Success
  OPERATION_SUCCESSFUL: HTTP_STATUS.OK,
  RESOURCE_CREATED: HTTP_STATUS.CREATED,
  RESOURCE_UPDATED: HTTP_STATUS.OK,
  RESOURCE_DELETED: HTTP_STATUS.NO_CONTENT,
  OPERATION_ACCEPTED: HTTP_STATUS.ACCEPTED,
};

/**
 * Get appropriate status code for a scenario
 * @param {string} scenario - The scenario key
 * @param {number} fallback - Fallback status code
 * @returns {number} - HTTP status code
 */
export function getStatusCodeForScenario(
  scenario,
  fallback = HTTP_STATUS.INTERNAL_SERVER_ERROR
) {
  return STATUS_MAPPINGS[scenario] || fallback;
}

/**
 * Validate status code
 * @param {number} statusCode - Status code to validate
 * @returns {boolean} - Whether status code is valid
 */
export function isValidStatusCode(statusCode) {
  return Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600;
}

/**
 * Get status code description
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Status code description
 */
export function getStatusCodeDescription(statusCode) {
  const descriptions = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  return descriptions[statusCode] || 'Unknown Status';
}

/**
 * Create standardized response with proper status code
 * @param {Object} data - Response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Standardized response object
 */
export function createStandardResponse(
  data = null,
  message = 'Success',
  statusCode = HTTP_STATUS.OK,
  meta = {}
) {
  const response = {
    success: isSuccessStatus(statusCode),
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  if (!isSuccessStatus(statusCode)) {
    response.error = message;
  }

  return {
    response,
    statusCode,
  };
}
