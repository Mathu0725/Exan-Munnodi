import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { HTTP_STATUS, getStatusCodeForScenario } from '@/lib/http/statusCodes';

/**
 * Custom error classes for different types of errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(
      message,
      getStatusCodeForScenario('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST)
    );
    this.field = field;
    this.type = 'validation_error';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(
      message,
      getStatusCodeForScenario(
        'AUTHENTICATION_REQUIRED',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
    this.type = 'authentication_error';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(
      message,
      getStatusCodeForScenario(
        'INSUFFICIENT_PERMISSIONS',
        HTTP_STATUS.FORBIDDEN
      )
    );
    this.type = 'authorization_error';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(
      `${resource} not found`,
      getStatusCodeForScenario('RESOURCE_NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    );
    this.type = 'not_found_error';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(
      message,
      getStatusCodeForScenario('RESOURCE_ALREADY_EXISTS', HTTP_STATUS.CONFLICT)
    );
    this.type = 'conflict_error';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(
      message,
      getStatusCodeForScenario(
        'RATE_LIMIT_EXCEEDED',
        HTTP_STATUS.TOO_MANY_REQUESTS
      )
    );
    this.type = 'rate_limit_error';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(
      message,
      getStatusCodeForScenario(
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
    this.type = 'database_error';
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error, includeStack = false) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    error: error.message || 'An unexpected error occurred',
    type: error.type || 'internal_error',
    timestamp: new Date().toISOString(),
  };

  // Add field information for validation errors
  if (error.field) {
    response.field = error.field;
  }

  // Add stack trace in development
  if (isDevelopment && includeStack && error.stack) {
    response.stack = error.stack;
  }

  // Add additional details for specific error types
  if (error.code) {
    response.code = error.code;
  }

  return response;
}

/**
 * Centralized error handler middleware
 */
export function errorHandler(error, request) {
  logger.error('Error Handler', {
    message: error.message,
    stack: error.stack,
    url: request?.url,
    method: request?.method,
    timestamp: new Date().toISOString(),
  });

  // Handle known error types
  if (error instanceof AppError) {
    const response = formatErrorResponse(error);
    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          formatErrorResponse(
            new ConflictError('A record with this information already exists')
          ),
          {
            status: getStatusCodeForScenario(
              'DUPLICATE_ENTRY',
              HTTP_STATUS.CONFLICT
            ),
          }
        );
      case 'P2025':
        return NextResponse.json(formatErrorResponse(new NotFoundError()), {
          status: getStatusCodeForScenario(
            'RESOURCE_NOT_FOUND',
            HTTP_STATUS.NOT_FOUND
          ),
        });
      case 'P2003':
        return NextResponse.json(
          formatErrorResponse(
            new ValidationError('Invalid reference to related record')
          ),
          {
            status: getStatusCodeForScenario(
              'VALIDATION_ERROR',
              HTTP_STATUS.BAD_REQUEST
            ),
          }
        );
      case 'P2014':
        return NextResponse.json(
          formatErrorResponse(
            new ValidationError('Invalid relation operation')
          ),
          {
            status: getStatusCodeForScenario(
              'VALIDATION_ERROR',
              HTTP_STATUS.BAD_REQUEST
            ),
          }
        );
      default:
        return NextResponse.json(
          formatErrorResponse(new DatabaseError('Database operation failed')),
          {
            status: getStatusCodeForScenario(
              'DATABASE_ERROR',
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            ),
          }
        );
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json(
      formatErrorResponse(new AuthenticationError('Invalid token')),
      {
        status: getStatusCodeForScenario(
          'INVALID_TOKEN',
          HTTP_STATUS.UNAUTHORIZED
        ),
      }
    );
  }

  if (error.name === 'TokenExpiredError') {
    return NextResponse.json(
      formatErrorResponse(new AuthenticationError('Token has expired')),
      {
        status: getStatusCodeForScenario(
          'TOKEN_EXPIRED',
          HTTP_STATUS.UNAUTHORIZED
        ),
      }
    );
  }

  // Handle validation errors from Zod
  if (error.name === 'ZodError') {
    const validationError = new ValidationError(
      error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
    );
    return NextResponse.json(formatErrorResponse(validationError), {
      status: getStatusCodeForScenario(
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST
      ),
    });
  }

  // Handle syntax errors (malformed JSON)
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      formatErrorResponse(new ValidationError('Invalid JSON format')),
      {
        status: getStatusCodeForScenario(
          'INVALID_FORMAT',
          HTTP_STATUS.BAD_REQUEST
        ),
      }
    );
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = formatErrorResponse(
    new AppError(isDevelopment ? error.message : 'Internal server error'),
    isDevelopment
  );

  return NextResponse.json(response, { status: 500 });
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorHandler(error, request);
    }
  };
}

/**
 * Async error handler for use in try-catch blocks
 */
export function handleAsyncError(fn) {
  return (request, context) => {
    return Promise.resolve(fn(request, context)).catch(error => {
      return errorHandler(error, request);
    });
  };
}

/**
 * Error logging utility
 */
export function logError(error, context = {}) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    type: error.type,
    context,
    timestamp: new Date().toISOString(),
    url: context.url,
    method: context.method,
    userId: context.userId,
  };

  // Log using Winston
  logger.error('Application Error', errorLog);
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(
  data,
  message = 'Success',
  statusCode = HTTP_STATUS.OK
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message,
  statusCode = HTTP_STATUS.BAD_REQUEST,
  type = 'error'
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      type,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
