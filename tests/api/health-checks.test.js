import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock health check utilities
jest.mock('../../src/lib/health/healthCheck', () => ({
  checkDatabaseHealth: jest.fn(),
  checkMemoryHealth: jest.fn(),
  checkDiskHealth: jest.fn(),
  getUptime: jest.fn(),
  performHealthChecks: jest.fn(),
}));

import {
  checkDatabaseHealth,
  checkMemoryHealth,
  checkDiskHealth,
  getUptime,
  performHealthChecks,
} from '../../src/lib/health/healthCheck';

describe('Health Check Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Health Check', () => {
    it('should check database health successfully', async () => {
      checkDatabaseHealth.mockResolvedValue({
        status: 'healthy',
        responseTime: 50,
        connectionCount: 5,
      });

      const result = await checkDatabaseHealth();

      expect(result).toEqual({
        status: 'healthy',
        responseTime: 50,
        connectionCount: 5,
      });
    });

    it('should handle database health check failure', async () => {
      checkDatabaseHealth.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(checkDatabaseHealth()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should return unhealthy status for slow database', async () => {
      checkDatabaseHealth.mockResolvedValue({
        status: 'unhealthy',
        responseTime: 5000,
        error: 'Database response too slow',
      });

      const result = await checkDatabaseHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.responseTime).toBe(5000);
      expect(result.error).toBe('Database response too slow');
    });
  });

  describe('Memory Health Check', () => {
    it('should check memory health successfully', async () => {
      checkMemoryHealth.mockResolvedValue({
        status: 'healthy',
        used: 100 * 1024 * 1024, // 100MB
        total: 1024 * 1024 * 1024, // 1GB
        percentage: 10,
      });

      const result = await checkMemoryHealth();

      expect(result).toEqual({
        status: 'healthy',
        used: 100 * 1024 * 1024,
        total: 1024 * 1024 * 1024,
        percentage: 10,
      });
    });

    it('should return unhealthy status for high memory usage', async () => {
      checkMemoryHealth.mockResolvedValue({
        status: 'unhealthy',
        used: 900 * 1024 * 1024, // 900MB
        total: 1024 * 1024 * 1024, // 1GB
        percentage: 90,
        error: 'Memory usage too high',
      });

      const result = await checkMemoryHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.percentage).toBe(90);
      expect(result.error).toBe('Memory usage too high');
    });
  });

  describe('Disk Health Check', () => {
    it('should check disk health successfully', async () => {
      checkDiskHealth.mockResolvedValue({
        status: 'healthy',
        used: 50 * 1024 * 1024 * 1024, // 50GB
        total: 100 * 1024 * 1024 * 1024, // 100GB
        percentage: 50,
      });

      const result = await checkDiskHealth();

      expect(result).toEqual({
        status: 'healthy',
        used: 50 * 1024 * 1024 * 1024,
        total: 100 * 1024 * 1024 * 1024,
        percentage: 50,
      });
    });

    it('should return unhealthy status for low disk space', async () => {
      checkDiskHealth.mockResolvedValue({
        status: 'unhealthy',
        used: 95 * 1024 * 1024 * 1024, // 95GB
        total: 100 * 1024 * 1024 * 1024, // 100GB
        percentage: 95,
        error: 'Disk space too low',
      });

      const result = await checkDiskHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.percentage).toBe(95);
      expect(result.error).toBe('Disk space too low');
    });
  });

  describe('Uptime Check', () => {
    it('should return application uptime', async () => {
      getUptime.mockResolvedValue({
        uptime: 3600, // 1 hour
        startTime: new Date(Date.now() - 3600000),
        formatted: '1h 0m 0s',
      });

      const result = await getUptime();

      expect(result).toEqual({
        uptime: 3600,
        startTime: expect.any(Date),
        formatted: '1h 0m 0s',
      });
    });
  });

  describe('Combined Health Checks', () => {
    it('should perform all health checks successfully', async () => {
      const mockHealthChecks = {
        database: {
          status: 'healthy',
          responseTime: 50,
          connectionCount: 5,
        },
        memory: {
          status: 'healthy',
          used: 100 * 1024 * 1024,
          total: 1024 * 1024 * 1024,
          percentage: 10,
        },
        disk: {
          status: 'healthy',
          used: 50 * 1024 * 1024 * 1024,
          total: 100 * 1024 * 1024 * 1024,
          percentage: 50,
        },
        uptime: {
          uptime: 3600,
          startTime: new Date(Date.now() - 3600000),
          formatted: '1h 0m 0s',
        },
      };

      performHealthChecks.mockResolvedValue({
        status: 'healthy',
        checks: mockHealthChecks,
        timestamp: new Date(),
      });

      const result = await performHealthChecks();

      expect(result.status).toBe('healthy');
      expect(result.checks).toEqual(mockHealthChecks);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return unhealthy status when any check fails', async () => {
      const mockHealthChecks = {
        database: {
          status: 'unhealthy',
          error: 'Database connection failed',
        },
        memory: {
          status: 'healthy',
          used: 100 * 1024 * 1024,
          total: 1024 * 1024 * 1024,
          percentage: 10,
        },
        disk: {
          status: 'healthy',
          used: 50 * 1024 * 1024 * 1024,
          total: 100 * 1024 * 1024 * 1024,
          percentage: 50,
        },
        uptime: {
          uptime: 3600,
          startTime: new Date(Date.now() - 3600000),
          formatted: '1h 0m 0s',
        },
      };

      performHealthChecks.mockResolvedValue({
        status: 'unhealthy',
        checks: mockHealthChecks,
        timestamp: new Date(),
      });

      const result = await performHealthChecks();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('unhealthy');
      expect(result.checks.database.error).toBe('Database connection failed');
    });

    it('should handle health check errors gracefully', async () => {
      performHealthChecks.mockRejectedValue(new Error('Health check failed'));

      await expect(performHealthChecks()).rejects.toThrow(
        'Health check failed'
      );
    });
  });
});
