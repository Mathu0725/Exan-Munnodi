import { createMocks } from 'node-mocks-http';
import { GET as getDatabaseMetricsHandler } from '../../app/api/database/metrics/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  $queryRaw: jest.fn(),
  $metrics: {
    getConnectionPoolStats: jest.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

describe('Database API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/database/metrics', () => {
    it('should return database metrics', async () => {
      const mockMetrics = {
        activeConnections: 5,
        idleConnections: 10,
        totalConnections: 15,
        maxConnections: 20,
      };

      prisma.$metrics.getConnectionPoolStats.mockResolvedValue(mockMetrics);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getDatabaseMetricsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.connectionPool).toBeDefined();
      expect(data.data.connectionPool.activeConnections).toBe(5);
      expect(data.data.connectionPool.idleConnections).toBe(10);
      expect(data.data.connectionPool.totalConnections).toBe(15);
      expect(data.data.connectionPool.maxConnections).toBe(20);
    });

    it('should return error when metrics retrieval fails', async () => {
      prisma.$metrics.getConnectionPoolStats.mockRejectedValue(
        new Error('Metrics retrieval failed')
      );

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getDatabaseMetricsHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Failed to retrieve database metrics');
    });

    it('should include query performance metrics', async () => {
      const mockMetrics = {
        activeConnections: 5,
        idleConnections: 10,
        totalConnections: 15,
        maxConnections: 20,
      };

      prisma.$metrics.getConnectionPoolStats.mockResolvedValue(mockMetrics);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getDatabaseMetricsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.queryPerformance).toBeDefined();
      expect(data.data.queryPerformance.averageQueryTime).toBeDefined();
      expect(data.data.queryPerformance.totalQueries).toBeDefined();
      expect(data.data.queryPerformance.slowQueries).toBeDefined();
    });
  });
});
