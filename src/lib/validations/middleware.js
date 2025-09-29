import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  sanitizeRequestBody,
} from '@/lib/security/sanitization';

/**
 * Validates request body against a Zod schema
 * @param {Object} schema - Zod schema to validate against
 * @param {Object} data - Data to validate
 * @returns {Object} - { success: boolean, data?: any, error?: string }
 */
export function validateBody(schema, data) {
  try {
    // First sanitize the data
    const sanitizedData = sanitizeRequestBody(data);

    // Then validate with Zod
    const validatedData = schema.parse(sanitizedData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error.errors) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: error.message || 'Validation failed' };
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param {Object} schema - Zod schema to validate against
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} - { success: boolean, data?: any, error?: string }
 */
export function validateQuery(schema, searchParams) {
  try {
    // Convert URLSearchParams to object
    const queryObject = {};
    for (const [key, value] of searchParams.entries()) {
      queryObject[key] = value;
    }

    // Sanitize query parameters
    const sanitizedQuery = sanitizeObject(queryObject, {
      sanitizeStrings: true,
      sanitizeUrls: true,
      sanitizeEmails: true,
      sanitizePhones: true,
    });

    const validatedData = schema.parse(sanitizedQuery);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error.errors) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return {
      success: false,
      error: error.message || 'Query validation failed',
    };
  }
}

/**
 * Validates path parameters against a Zod schema
 * @param {Object} schema - Zod schema to validate against
 * @param {Object} params - Path parameters
 * @returns {Object} - { success: boolean, data?: any, error?: string }
 */
export function validateParams(schema, params) {
  try {
    // Sanitize path parameters
    const sanitizedParams = sanitizeObject(params, {
      sanitizeStrings: true,
      sanitizeUrls: true,
      sanitizeEmails: true,
      sanitizePhones: true,
    });

    const validatedData = schema.parse(sanitizedParams);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error.errors) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return {
      success: false,
      error: error.message || 'Parameter validation failed',
    };
  }
}

/**
 * Creates a validation error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse} - Error response
 */
export function createValidationErrorResponse(message, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      type: 'validation_error',
    },
    { status }
  );
}

/**
 * Higher-order function to wrap API route handlers with validation
 * @param {Object} config - Validation configuration
 * @param {Object} config.body - Body validation schema
 * @param {Object} config.query - Query validation schema
 * @param {Object} config.params - Params validation schema
 * @param {Function} handler - Original route handler
 * @returns {Function} - Wrapped handler with validation
 */
export function withValidation(config, handler) {
  return async (request, context) => {
    try {
      const validatedData = {};

      // Validate request body if schema provided
      if (config.body) {
        const body = await request.json();
        const bodyValidation = validateBody(config.body, body);
        if (!bodyValidation.success) {
          return createValidationErrorResponse(bodyValidation.error);
        }
        validatedData.body = bodyValidation.data;
      }

      // Validate query parameters if schema provided
      if (config.query) {
        const { searchParams } = new URL(request.url);
        const queryValidation = validateQuery(config.query, searchParams);
        if (!queryValidation.success) {
          return createValidationErrorResponse(queryValidation.error);
        }
        validatedData.query = queryValidation.data;
      }

      // Validate path parameters if schema provided
      if (config.params && context?.params) {
        const paramsValidation = validateParams(config.params, context.params);
        if (!paramsValidation.success) {
          return createValidationErrorResponse(paramsValidation.error);
        }
        validatedData.params = paramsValidation.data;
      }

      // Call the original handler with validated data
      return await handler(request, context, validatedData);
    } catch (error) {
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal validation error',
          type: 'validation_error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Sanitizes input data to prevent XSS and other attacks
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
export function sanitizeInput(data) {
  return sanitizeObject(data, {
    sanitizeStrings: true,
    sanitizeUrls: true,
    sanitizeEmails: true,
    sanitizePhones: true,
  });
}
