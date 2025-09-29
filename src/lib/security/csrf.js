import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * CSRF protection for cookie-based authentication
 */

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// In-memory store for CSRF tokens (use Redis in production)
const csrfTokens = new Map(); // token -> { userId, expiresAt, createdAt }

/**
 * Generate a secure CSRF token
 * @returns {string} - CSRF token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a CSRF token for a user
 * @param {number} userId - User ID
 * @returns {Object} - Token data
 */
export function createCsrfToken(userId) {
  const token = generateCsrfToken();
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY;
  const createdAt = Date.now();

  csrfTokens.set(token, {
    userId,
    expiresAt,
    createdAt,
  });

  return {
    token,
    expiresAt: new Date(expiresAt),
  };
}

/**
 * Validate a CSRF token
 * @param {string} token - CSRF token to validate
 * @param {number} userId - User ID to validate against
 * @returns {boolean} - Whether the token is valid
 */
export function validateCsrfToken(token, userId) {
  if (!token || !userId) {
    return false;
  }

  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    return false;
  }

  // Check if token belongs to user
  if (tokenData.userId !== userId) {
    return false;
  }

  // Check if token has expired
  if (Date.now() > tokenData.expiresAt) {
    csrfTokens.delete(token);
    return false;
  }

  return true;
}

/**
 * Revoke a CSRF token
 * @param {string} token - Token to revoke
 */
export function revokeCsrfToken(token) {
  csrfTokens.delete(token);
}

/**
 * Revoke all CSRF tokens for a user
 * @param {number} userId - User ID
 */
export function revokeUserCsrfTokens(userId) {
  for (const [token, data] of csrfTokens.entries()) {
    if (data.userId === userId) {
      csrfTokens.delete(token);
    }
  }
}

/**
 * Clean up expired tokens
 */
export function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(token);
    }
  }
}

/**
 * Get CSRF token from request
 * @param {Request} request - Request object
 * @returns {string|null} - CSRF token or null
 */
export function getCsrfTokenFromRequest(request) {
  // Try header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Try form data
  const contentType = request.headers.get('content-type');
  if (
    contentType &&
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    // This would need to be handled in the route handler
    return null;
  }

  return null;
}

/**
 * Create CSRF cookie
 * @param {string} token - CSRF token
 * @param {Date} expiresAt - Expiration date
 * @param {boolean} isProduction - Whether in production
 * @returns {string} - Cookie string
 */
export function createCsrfCookie(token, expiresAt, isProduction = false) {
  const cookieParts = [
    `${CSRF_COOKIE_NAME}=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    `Path=/`,
    `Expires=${expiresAt.toUTCString()}`,
  ];

  if (isProduction) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
}

/**
 * CSRF middleware for API routes
 * @param {Request} request - Request object
 * @param {number} userId - User ID from authentication
 * @returns {Object} - Validation result
 */
export function validateCsrfProtection(request, userId) {
  const token = getCsrfTokenFromRequest(request);

  if (!token) {
    return {
      valid: false,
      error: 'CSRF token missing',
      status: 403,
    };
  }

  if (!validateCsrfToken(token, userId)) {
    return {
      valid: false,
      error: 'Invalid CSRF token',
      status: 403,
    };
  }

  return {
    valid: true,
  };
}

/**
 * Create CSRF error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse} - Error response
 */
export function createCsrfErrorResponse(
  message = 'CSRF token validation failed',
  status = 403
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      type: 'csrf_error',
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * CSRF protection middleware factory
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createCsrfMiddleware(options = {}) {
  const {
    skipPaths = ['/api/auth/login', '/api/auth/register'],
    requireCsrf = true,
  } = options;

  return async (request, userId) => {
    const url = new URL(request.url);

    // Skip CSRF protection for certain paths
    if (skipPaths.some(path => url.pathname.startsWith(path))) {
      return { valid: true };
    }

    // Skip for GET requests (read-only)
    if (request.method === 'GET') {
      return { valid: true };
    }

    if (!requireCsrf) {
      return { valid: true };
    }

    if (!userId) {
      return {
        valid: false,
        error: 'Authentication required for CSRF protection',
        status: 401,
      };
    }

    return validateCsrfProtection(request, userId);
  };
}

/**
 * Add CSRF token to response
 * @param {NextResponse} response - Response object
 * @param {string} token - CSRF token
 * @param {Date} expiresAt - Expiration date
 * @param {boolean} isProduction - Whether in production
 * @returns {NextResponse} - Modified response
 */
export function addCsrfTokenToResponse(
  response,
  token,
  expiresAt,
  isProduction = false
) {
  const cookie = createCsrfCookie(token, expiresAt, isProduction);
  response.headers.append('Set-Cookie', cookie);
  return response;
}

/**
 * Get CSRF token for user (for frontend)
 * @param {number} userId - User ID
 * @returns {Object} - Token data
 */
export function getCsrfTokenForUser(userId) {
  // Clean up expired tokens first
  cleanupExpiredTokens();

  // Check if user already has a valid token
  for (const [token, data] of csrfTokens.entries()) {
    if (data.userId === userId && Date.now() < data.expiresAt) {
      return {
        token,
        expiresAt: new Date(data.expiresAt),
      };
    }
  }

  // Create new token
  return createCsrfToken(userId);
}

/**
 * CSRF token statistics (for monitoring)
 * @returns {Object} - Statistics
 */
export function getCsrfTokenStats() {
  const now = Date.now();
  const active = Array.from(csrfTokens.values()).filter(
    data => now < data.expiresAt
  );
  const expired = Array.from(csrfTokens.values()).filter(
    data => now >= data.expiresAt
  );

  return {
    total: csrfTokens.size,
    active: active.length,
    expired: expired.length,
    uniqueUsers: new Set(active.map(data => data.userId)).size,
  };
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
