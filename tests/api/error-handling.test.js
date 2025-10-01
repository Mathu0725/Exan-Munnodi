import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock error handling utilities
jest.mock('../../src/lib/errors/errorHandler', () => ({
  withErrorHandler: jest.fn(handler => handler),
  createErrorResponse: jest.fn(),
  createSuccessResponse: jest.fn(),
  AppError: class AppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message = 'Authentication failed') {
      super(message);
      this.statusCode = 401;
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message = 'Authorization failed') {
      super(message);
      this.statusCode = 403;
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
      super(message);
      this.statusCode = 404;
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message = 'Validation failed') {
      super(message);
      this.statusCode = 400;
    }
  },
  ConflictError: class ConflictError extends Error {
    constructor(message = 'Resource conflict') {
      super(message);
      this.statusCode = 409;
    }
  },
  RateLimitError: class RateLimitError extends Error {
    constructor(message = 'Rate limit exceeded') {
      super(message);
      this.statusCode = 429;
    }
  },
  DatabaseError: class DatabaseError extends Error {
    constructor(message = 'Database error') {
      super(message);
      this.statusCode = 500;
    }
  },
}));

import {
  withErrorHandler,
  createErrorResponse,
  createSuccessResponse,
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  DatabaseError,
} from '../../src/lib/errors/errorHandler';

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withErrorHandler', () => {
    it('should handle successful requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true });
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
      expect(createErrorResponse).not.toHaveBeenCalled();
    });

    it('should handle AppError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new AppError('Custom error', 400));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom error',
          statusCode: 400,
        }),
        400
      );
    });

    it('should handle AuthenticationError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new AuthenticationError('Invalid credentials'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: 401,
        }),
        401
      );
    });

    it('should handle AuthorizationError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new AuthorizationError('Insufficient permissions'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions',
          statusCode: 403,
        }),
        403
      );
    });

    it('should handle NotFoundError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new NotFoundError('User not found'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        }),
        404
      );
    });

    it('should handle ValidationError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new ValidationError('Invalid input data'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid input data',
          statusCode: 400,
        }),
        400
      );
    });

    it('should handle ConflictError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new ConflictError('Resource already exists'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Resource already exists',
          statusCode: 409,
        }),
        409
      );
    });

    it('should handle RateLimitError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new RateLimitError('Too many requests'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Too many requests',
          statusCode: 429,
        }),
        429
      );
    });

    it('should handle DatabaseError', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new DatabaseError('Database connection failed'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
          statusCode: 500,
        }),
        500
      );
    });

    it('should handle generic errors', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected error'));
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected error',
        }),
        500
      );
    });

    it('should handle Prisma errors', async () => {
      const prismaError = new Error('Unique constraint failed');
      prismaError.code = 'P2002';
      prismaError.meta = { target: 'email' };

      const mockHandler = jest.fn().mockRejectedValue(prismaError);
      const wrappedHandler = withErrorHandler(mockHandler);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(createErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A record with this email already exists',
        }),
        409
      );
    });
  });
});
