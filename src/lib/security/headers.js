/**
 * Security headers configuration for Next.js
 * Inspired by Helmet.js but adapted for Next.js middleware
 */

/**
 * Get security headers based on environment
 * @param {boolean} isProduction - Whether we're in production
 * @returns {Object} - Security headers object
 */
export function getSecurityHeaders(isProduction = false) {
  const headers = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'bluetooth=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'gamepad=()',
      'midi=()',
      'notifications=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ].join(', '),

    // Cross-Origin policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',

    // XSS Protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',
  };

  // Production-only headers
  if (isProduction) {
    headers['Strict-Transport-Security'] =
      'max-age=63072000; includeSubDomains; preload';
  }

  return headers;
}

/**
 * Get Content Security Policy based on environment
 * @param {boolean} isProduction - Whether we're in production
 * @param {Object} options - CSP options
 * @returns {string} - CSP header value
 */
export function getContentSecurityPolicy(isProduction = false, options = {}) {
  const {
    allowUnsafeEval = !isProduction,
    allowUnsafeInline = true,
    allowDataUrls = true,
    allowBlobUrls = true,
    allowWs = !isProduction,
    additionalSources = [],
  } = options;

  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(allowUnsafeEval ? ["'unsafe-eval'"] : []),
      ...(allowUnsafeInline ? ["'unsafe-inline'"] : []),
      ...additionalSources,
    ],
    'style-src': [
      "'self'",
      ...(allowUnsafeInline ? ["'unsafe-inline'"] : []),
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      ...(allowDataUrls ? ['data:'] : []),
      ...(allowBlobUrls ? ['blob:'] : []),
      'https:',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      ...(allowDataUrls ? ['data:'] : []),
    ],
    'connect-src': ["'self'", ...(allowWs ? ['ws:', 'wss:'] : []), 'https:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isProduction ? [] : undefined,
  };

  // Filter out undefined values and join arrays
  const cspString = Object.entries(directives)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key} ${value.join(' ')}`;
      }
      return `${key} ${value}`;
    })
    .join('; ');

  return cspString;
}

/**
 * Get security headers for API routes
 * @param {boolean} isProduction - Whether we're in production
 * @returns {Object} - API-specific security headers
 */
export function getApiSecurityHeaders(isProduction = false) {
  return {
    ...getSecurityHeaders(isProduction),
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  };
}

/**
 * Get security headers for static assets
 * @param {boolean} isProduction - Whether we're in production
 * @returns {Object} - Static asset security headers
 */
export function getStaticAssetSecurityHeaders(isProduction = false) {
  return {
    'Cache-Control': isProduction
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };
}

/**
 * Apply security headers to a NextResponse
 * @param {NextResponse} response - The response to modify
 * @param {Object} options - Header options
 * @returns {NextResponse} - Modified response
 */
export function applySecurityHeaders(response, options = {}) {
  const {
    isProduction = process.env.NODE_ENV === 'production',
    isApi = false,
    isStatic = false,
    cspOptions = {},
  } = options;

  let headers;

  if (isApi) {
    headers = getApiSecurityHeaders(isProduction);
  } else if (isStatic) {
    headers = getStaticAssetSecurityHeaders(isProduction);
  } else {
    headers = getSecurityHeaders(isProduction);
  }

  // Add CSP header
  const csp = getContentSecurityPolicy(isProduction, cspOptions);
  headers['Content-Security-Policy'] = csp;

  // Apply headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Security headers middleware factory
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createSecurityHeadersMiddleware(options = {}) {
  return request => {
    const url = new URL(request.url);
    const isProduction = process.env.NODE_ENV === 'production';
    const isApi = url.pathname.startsWith('/api/');
    const isStatic =
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/static/') ||
      url.pathname.match(
        /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/
      );

    return {
      isApi,
      isStatic,
      isProduction,
      cspOptions: {
        allowUnsafeEval: !isProduction,
        allowUnsafeInline: true,
        allowDataUrls: true,
        allowBlobUrls: true,
        allowWs: !isProduction,
        additionalSources: options.additionalSources || [],
      },
    };
  };
}

/**
 * Validate security headers configuration
 * @returns {Object} - Validation result
 */
export function validateSecurityHeaders() {
  const errors = [];
  const warnings = [];

  // Check for unsafe CSP directives in production
  if (process.env.NODE_ENV === 'production') {
    const csp = getContentSecurityPolicy(true);
    if (csp.includes('unsafe-eval')) {
      warnings.push('unsafe-eval is enabled in production CSP');
    }
    if (csp.includes('unsafe-inline')) {
      warnings.push('unsafe-inline is enabled in production CSP');
    }
  }

  // Check for missing HSTS in production
  if (process.env.NODE_ENV === 'production') {
    const headers = getSecurityHeaders(true);
    if (!headers['Strict-Transport-Security']) {
      errors.push('HSTS header is missing in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate configuration on import
const validation = validateSecurityHeaders();
if (!validation.isValid) {
  console.error('Security Headers Configuration Errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('Security Headers Configuration Warnings:', validation.warnings);
}
