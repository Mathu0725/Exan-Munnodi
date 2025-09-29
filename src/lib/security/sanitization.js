import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Comprehensive request sanitization and XSS protection
 */

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html, options = {}) {
  if (typeof html !== 'string') return html;

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_NAMED_PROPS: true,
    ...options,
  };

  return DOMPurify.sanitize(html, defaultOptions);
}

/**
 * Sanitize plain text to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return text;

  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/file:/gi, '') // Remove file: protocol
    .replace(/ftp:/gi, '') // Remove ftp: protocol
    .trim();
}

/**
 * Sanitize URL to prevent XSS and malicious redirects
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return url;

  // Remove dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'ftp:',
    'about:',
  ];

  const lowerUrl = url.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#';
    }
  }

  // Validate URL format
  if (!validator.isURL(url, { require_protocol: false })) {
    return '#';
  }

  return url;
}

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;

  const sanitized = email.trim().toLowerCase();

  if (!validator.isEmail(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return phone;

  // Remove all non-digit characters except + at the beginning
  const sanitized = phone.replace(/[^\d+]/g, '');

  if (!validator.isMobilePhone(sanitized)) {
    throw new Error('Invalid phone number format');
  }

  return sanitized;
}

/**
 * Sanitize SQL input to prevent injection
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeSqlInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .replace(/union/gi, '') // Remove UNION
    .replace(/select/gi, '') // Remove SELECT
    .replace(/insert/gi, '') // Remove INSERT
    .replace(/update/gi, '') // Remove UPDATE
    .replace(/delete/gi, '') // Remove DELETE
    .replace(/drop/gi, '') // Remove DROP
    .replace(/create/gi, '') // Remove CREATE
    .replace(/alter/gi, '') // Remove ALTER
    .replace(/exec/gi, '') // Remove EXEC
    .replace(/execute/gi, '') // Remove EXECUTE
    .trim();
}

/**
 * Sanitize file name to prevent path traversal
 * @param {string} filename - File name to sanitize
 * @returns {string} - Sanitized file name
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return filename;

  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous characters
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .trim();
}

/**
 * Sanitize JSON input
 * @param {any} input - Input to sanitize
 * @returns {any} - Sanitized input
 */
export function sanitizeJsonInput(input) {
  if (typeof input === 'string') {
    return sanitizeText(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeJsonInput(item));
  }

  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeText(key);
      sanitized[sanitizedKey] = sanitizeJsonInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Sanitize object properties recursively
 * @param {any} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  const {
    sanitizeStrings = true,
    sanitizeUrls = true,
    sanitizeEmails = true,
    sanitizePhones = true,
    allowedKeys = null,
    skipKeys = [],
  } = options;

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    if (sanitizeStrings) {
      return sanitizeText(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip if key is in skip list
      if (skipKeys.includes(key)) {
        sanitized[key] = value;
        continue;
      }

      // Skip if allowedKeys is specified and key is not in the list
      if (allowedKeys && !allowedKeys.includes(key)) {
        continue;
      }

      const sanitizedKey = sanitizeText(key);
      let sanitizedValue = value;

      // Apply specific sanitization based on key patterns
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('email') && sanitizeEmails) {
          try {
            sanitizedValue = sanitizeEmail(value);
          } catch (error) {
            sanitizedValue = sanitizeText(value);
          }
        } else if (key.toLowerCase().includes('phone') && sanitizePhones) {
          try {
            sanitizedValue = sanitizePhone(value);
          } catch (error) {
            sanitizedValue = sanitizeText(value);
          }
        } else if (key.toLowerCase().includes('url') && sanitizeUrls) {
          sanitizedValue = sanitizeUrl(value);
        } else if (sanitizeStrings) {
          sanitizedValue = sanitizeText(value);
        }
      } else if (typeof value === 'object') {
        sanitizedValue = sanitizeObject(value, options);
      }

      sanitized[sanitizedKey] = sanitizedValue;
    }

    return sanitized;
  }

  return obj;
}

/**
 * Validate and sanitize request body
 * @param {any} body - Request body
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized body
 */
export function sanitizeRequestBody(body, options = {}) {
  const defaultOptions = {
    sanitizeStrings: true,
    sanitizeUrls: true,
    sanitizeEmails: true,
    sanitizePhones: true,
    maxDepth: 10,
    maxStringLength: 10000,
  };

  const sanitized = sanitizeObject(body, { ...defaultOptions, ...options });

  // Validate depth
  if (getObjectDepth(sanitized) > defaultOptions.maxDepth) {
    throw new Error('Object depth exceeds maximum allowed');
  }

  return sanitized;
}

/**
 * Get object depth
 * @param {any} obj - Object to check
 * @param {number} currentDepth - Current depth
 * @returns {number} - Object depth
 */
function getObjectDepth(obj, currentDepth = 0) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return currentDepth;
  }

  if (Array.isArray(obj)) {
    return Math.max(...obj.map(item => getObjectDepth(item, currentDepth + 1)));
  }

  const depths = Object.values(obj).map(value =>
    getObjectDepth(value, currentDepth + 1)
  );
  return Math.max(...depths, currentDepth);
}

/**
 * Create sanitization middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createSanitizationMiddleware(options = {}) {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeHeaders = false,
    bodyOptions = {},
    queryOptions = {},
    headerOptions = {},
  } = options;

  return async (request, next) => {
    try {
      // Sanitize query parameters
      if (sanitizeQuery) {
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        const sanitizedQuery = sanitizeObject(queryParams, queryOptions);

        // Update URL with sanitized query params
        const newUrl = new URL(request.url);
        newUrl.search = new URLSearchParams(sanitizedQuery).toString();
        request.url = newUrl.toString();
      }

      // Sanitize headers
      if (sanitizeHeaders) {
        const headers = Object.fromEntries(request.headers.entries());
        const sanitizedHeaders = sanitizeObject(headers, headerOptions);

        // Note: Headers are read-only in Next.js, so we can't modify them directly
        // This is mainly for logging purposes
      }

      // Sanitize request body
      if (sanitizeBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const body = await request.json();
          const sanitizedBody = sanitizeRequestBody(body, bodyOptions);

          // Create new request with sanitized body
          const newRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody),
          });

          return next(newRequest);
        }
      }

      return next(request);
    } catch (error) {
      console.error('Sanitization error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid input data',
          type: 'sanitization_error',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
