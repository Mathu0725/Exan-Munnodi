/**
 * CORS configuration for the application
 */

// Environment-based CORS configuration
const getCorsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Base allowed origins
  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Add production origins from environment variables
  const productionOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.API_URL,
  ].filter(Boolean);

  // Development origins (more permissive)
  const developmentOrigins = [
    ...baseOrigins,
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:8080',
    'http://localhost:8081',
  ];

  return {
    allowedOrigins: isProduction
      ? [...baseOrigins, ...productionOrigins]
      : developmentOrigins,

    allowedMethods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
      'HEAD',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Forwarded-For',
      'X-Real-IP',
      'User-Agent',
    ],

    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Current-Page',
      'X-Per-Page',
    ],

    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
};

export const corsConfig = getCorsConfig();

/**
 * Check if an origin is allowed
 * @param {string} origin - The origin to check
 * @returns {boolean} - Whether the origin is allowed
 */
export function isOriginAllowed(origin) {
  if (!origin) return false;
  return corsConfig.allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a response
 * @param {string} origin - The requesting origin
 * @returns {Object} - CORS headers object
 */
export function getCorsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': corsConfig.exposedHeaders.join(', '),
    'Access-Control-Allow-Credentials': corsConfig.credentials.toString(),
    'Access-Control-Max-Age': corsConfig.maxAge.toString(),
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

/**
 * Create a CORS error response
 * @param {string} message - Error message
 * @returns {Response} - Error response
 */
export function createCorsErrorResponse(
  message = 'CORS policy violation: Origin not allowed'
) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      type: 'cors_error',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow error to be read
      },
    }
  );
}

/**
 * Create a CORS preflight response
 * @param {string} origin - The requesting origin
 * @returns {Response} - Preflight response
 */
export function createCorsPreflightResponse(origin) {
  if (!isOriginAllowed(origin)) {
    return createCorsErrorResponse();
  }

  const headers = getCorsHeaders(origin);

  return new Response(null, {
    status: 200,
    headers,
  });
}

/**
 * Validate CORS configuration
 * @returns {Object} - Validation result
 */
export function validateCorsConfig() {
  const errors = [];
  const warnings = [];

  // Check for required environment variables in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
      errors.push(
        'FRONTEND_URL environment variable is required in production'
      );
    }
  }

  // Check for wildcard origins in production
  if (process.env.NODE_ENV === 'production') {
    const hasWildcard = corsConfig.allowedOrigins.some(origin =>
      origin.includes('*')
    );
    if (hasWildcard) {
      warnings.push('Wildcard origins detected in production CORS config');
    }
  }

  // Check for localhost in production
  if (process.env.NODE_ENV === 'production') {
    const hasLocalhost = corsConfig.allowedOrigins.some(
      origin => origin.includes('localhost') || origin.includes('127.0.0.1')
    );
    if (hasLocalhost) {
      warnings.push('Localhost origins detected in production CORS config');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate configuration on import
const validation = validateCorsConfig();
if (!validation.isValid) {
  console.error('CORS Configuration Errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('CORS Configuration Warnings:', validation.warnings);
}
