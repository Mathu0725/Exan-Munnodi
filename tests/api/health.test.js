import { createMocks } from 'node-mocks-http';
import { GET as getHealthHandler } from '../../app/api/health/route';
import { GET as getStatusHandler } from '../../app/api/status/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  $queryRaw: jest.fn(),
}));

import prisma from '../../src/lib/prisma';

describe('Health Check API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when all checks pass', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 'ok' }]);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getHealthHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
      expect(data.data.checks.database).toBe('healthy');
      expect(data.data.checks.memory).toBe('healthy');
      expect(data.data.checks.disk).toBe('healthy');
    });

    it('should return unhealthy status when database check fails', async () => {
      prisma.$queryRaw.mockRejectedValue(
        new Error('Database connection failed')
      );

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getHealthHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.data.status).toBe('unhealthy');
      expect(data.data.checks.database).toBe('unhealthy');
    });

    it('should return unhealthy status when memory check fails', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 'ok' }]);

      // Mock process.memoryUsage to return high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        rss: 2 * 1024 * 1024 * 1024, // 2GB
        heapTotal: 1.5 * 1024 * 1024 * 1024, // 1.5GB
        heapUsed: 1.2 * 1024 * 1024 * 1024, // 1.2GB
        external: 0,
        arrayBuffers: 0,
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getHealthHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.data.status).toBe('unhealthy');
      expect(data.data.checks.memory).toBe('unhealthy');

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });

    it('should return unhealthy status when disk check fails', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 'ok' }]);

      // Mock fs.statSync to return low disk space
      const fs = require('fs');
      const originalStatSync = fs.statSync;
      fs.statSync = jest.fn().mockReturnValue({
        isDirectory: () => true,
      });

      // Mock fs.readdirSync to return empty directory
      const originalReaddirSync = fs.readdirSync;
      fs.readdirSync = jest.fn().mockReturnValue([]);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getHealthHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.data.status).toBe('unhealthy');
      expect(data.data.checks.disk).toBe('unhealthy');

      // Restore original functions
      fs.statSync = originalStatSync;
      fs.readdirSync = originalReaddirSync;
    });
  });

  describe('GET /api/status', () => {
    it('should return simple OK status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('OK');
    });
  });
});
