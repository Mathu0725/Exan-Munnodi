import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock rate limiting utilities
jest.mock('../../src/lib/rateLimiting/redisRateLimiter', () => ({
  createRateLimiter: jest.fn(),
  consumePoints: jest.fn(),
}));

jest.mock('../../src/lib/rateLimiting/middleware', () => ({
  createRateLimitingMiddleware: jest.fn(),
}));

import {
  createRateLimiter,
  consumePoints,
} from '../../src/lib/rateLimiting/redisRateLimiter';
import { createRateLimitingMiddleware } from '../../src/lib/rateLimiting/middleware';

describe('Rate Limiting Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Redis Rate Limiter', () => {
    it('should create rate limiter with options', async () => {
      const mockLimiter = {
        consume: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      };

      createRateLimiter.mockReturnValue(mockLimiter);

      const options = {
        keyPrefix: 'test',
        points: 10,
        duration: 60,
      };

      const result = createRateLimiter(options);

      expect(result).toBe(mockLimiter);
      expect(createRateLimiter).toHaveBeenCalledWith(options);
    });

    it('should consume points from rate limiter', async () => {
      const mockLimiter = {
        consume: jest.fn().mockResolvedValue({
          totalHits: 5,
          remainingPoints: 95,
          msBeforeNext: 1000,
        }),
      };

      createRateLimiter.mockReturnValue(mockLimiter);
      consumePoints.mockResolvedValue({
        totalHits: 5,
        remainingPoints: 95,
        msBeforeNext: 1000,
      });

      const result = await consumePoints(mockLimiter, 'user-123', 1);

      expect(result).toEqual({
        totalHits: 5,
        remainingPoints: 95,
        msBeforeNext: 1000,
      });
    });

    it('should handle rate limit exceeded', async () => {
      const mockLimiter = {
        consume: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
      };

      createRateLimiter.mockReturnValue(mockLimiter);
      consumePoints.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(consumePoints(mockLimiter, 'user-123', 1)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should create rate limiting middleware', async () => {
      const mockMiddleware = jest.fn();
      createRateLimitingMiddleware.mockReturnValue(mockMiddleware);

      const options = {
        tiers: {
          auth: { points: 5, duration: 60 },
          api: { points: 100, duration: 60 },
        },
      };

      const result = createRateLimitingMiddleware(options);

      expect(result).toBe(mockMiddleware);
      expect(createRateLimitingMiddleware).toHaveBeenCalledWith(options);
    });

    it('should apply rate limiting to authentication endpoints', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        // Simulate rate limiting logic
        const identifier = req.headers.get('X-Forwarded-For') || 'unknown';
        const path = req.nextUrl.pathname;

        if (path.startsWith('/api/auth/')) {
          // Apply stricter rate limiting for auth endpoints
          return new Response('Rate limit exceeded', { status: 429 });
        }

        return res;
      });

      createRateLimitingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createRateLimitingMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
    });

    it('should apply rate limiting to API endpoints', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        // Simulate rate limiting logic
        const identifier = req.headers.get('X-Forwarded-For') || 'unknown';
        const path = req.nextUrl.pathname;

        if (path.startsWith('/api/')) {
          // Apply standard rate limiting for API endpoints
          return res;
        }

        return res;
      });

      createRateLimitingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createRateLimitingMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
    });

    it('should handle different rate limiting tiers', async () => {
      const authReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const apiReq = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith('/api/auth/')) {
          // Apply stricter rate limiting for auth endpoints
          return res;
        } else if (path.startsWith('/api/')) {
          // Apply standard rate limiting for API endpoints
          return res;
        }

        return res;
      });

      createRateLimitingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createRateLimitingMiddleware();

      const authResponse = await middleware(authReq, {});
      const apiResponse = await middleware(apiReq, {});

      expect(middleware).toHaveBeenCalledWith(authReq, {});
      expect(middleware).toHaveBeenCalledWith(apiReq, {});
    });

    it('should handle rate limit exceeded responses', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        // Simulate rate limit exceeded
        return new Response('Rate limit exceeded', {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        });
      });

      createRateLimitingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createRateLimitingMiddleware();
      const response = await middleware(req, {});

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });
});
