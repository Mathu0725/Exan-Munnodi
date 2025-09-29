import { createMocks } from 'node-mocks-http';
import { GET as getRateLimitStatusHandler } from '../../app/api/rate-limit/status/route';
import { POST as resetRateLimitHandler } from '../../app/api/rate-limit/reset/route';
import { GET as getRateLimitStatsHandler } from '../../app/api/rate-limit/stats/route';

// Mock Redis
jest.mock('../../src/lib/rateLimiting/redisRateLimiter', () => ({
  createRateLimiter: jest.fn(),
  consumePoints: jest.fn(),
}));

import {
  createRateLimiter,
  consumePoints,
} from '../../src/lib/rateLimiting/redisRateLimiter';

describe('Rate Limit API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/rate-limit/status', () => {
    it('should return rate limit status for identifier', async () => {
      const mockLimiter = {
        get: jest.fn().mockResolvedValue({
          totalHits: 5,
          remainingPoints: 95,
          msBeforeNext: 1000,
        }),
      };

      createRateLimiter.mockReturnValue(mockLimiter);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          identifier: 'test-user',
        },
      });

      await getRateLimitStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.identifier).toBe('test-user');
      expect(data.data.totalHits).toBe(5);
      expect(data.data.remainingPoints).toBe(95);
    });

    it('should return error for missing identifier', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getRateLimitStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Identifier is required');
    });

    it('should return error for invalid identifier', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          identifier: '',
        },
      });

      await getRateLimitStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Identifier cannot be empty');
    });
  });

  describe('POST /api/rate-limit/reset', () => {
    it('should reset rate limit for identifier', async () => {
      const mockLimiter = {
        delete: jest.fn().mockResolvedValue(true),
      };

      createRateLimiter.mockReturnValue(mockLimiter);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          identifier: 'test-user',
        },
      });

      await resetRateLimitHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.message).toContain('Rate limit reset successfully');
    });

    it('should return error for missing identifier', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      });

      await resetRateLimitHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Identifier is required');
    });

    it('should return error for invalid identifier', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          identifier: '',
        },
      });

      await resetRateLimitHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Identifier cannot be empty');
    });
  });

  describe('GET /api/rate-limit/stats', () => {
    it('should return rate limiter statistics', async () => {
      const mockLimiter = {
        getStats: jest.fn().mockResolvedValue({
          totalRequests: 1000,
          blockedRequests: 50,
          allowedRequests: 950,
        }),
      };

      createRateLimiter.mockReturnValue(mockLimiter);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getRateLimitStatsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.totalRequests).toBe(1000);
      expect(data.data.blockedRequests).toBe(50);
      expect(data.data.allowedRequests).toBe(950);
    });

    it('should return error when stats retrieval fails', async () => {
      const mockLimiter = {
        getStats: jest
          .fn()
          .mockRejectedValue(new Error('Stats retrieval failed')),
      };

      createRateLimiter.mockReturnValue(mockLimiter);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getRateLimitStatsHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain(
        'Failed to retrieve rate limiter statistics'
      );
    });
  });
});
