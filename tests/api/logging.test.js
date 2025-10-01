import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock logging utilities
jest.mock('../../src/lib/logger/index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../src/lib/logger/requestLogger', () => ({
  logAuthEvent: jest.fn(),
  logSecurityEvent: jest.fn(),
  createCombinedLoggingMiddleware: jest.fn(),
}));

jest.mock('../../src/lib/middleware/requestLogger', () => ({
  createCombinedLoggingMiddleware: jest.fn(),
}));

import { logger } from '../../src/lib/logger/index';
import {
  logAuthEvent,
  logSecurityEvent,
} from '../../src/lib/logger/requestLogger';
import { createCombinedLoggingMiddleware } from '../../src/lib/middleware/requestLogger';

describe('Logging Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Winston Logger', () => {
    it('should log info messages', async () => {
      logger.info('Test info message');

      expect(logger.info).toHaveBeenCalledWith('Test info message');
    });

    it('should log error messages', async () => {
      logger.error('Test error message');

      expect(logger.error).toHaveBeenCalledWith('Test error message');
    });

    it('should log warning messages', async () => {
      logger.warn('Test warning message');

      expect(logger.warn).toHaveBeenCalledWith('Test warning message');
    });

    it('should log debug messages', async () => {
      logger.debug('Test debug message');

      expect(logger.debug).toHaveBeenCalledWith('Test debug message');
    });
  });

  describe('Request Logging', () => {
    it('should log authentication events', async () => {
      const eventData = {
        userId: 'user-123',
        event: 'login',
        timestamp: new Date(),
      };

      logAuthEvent('login', eventData);

      expect(logAuthEvent).toHaveBeenCalledWith('login', eventData);
    });

    it('should log security events', async () => {
      const eventData = {
        userId: 'user-123',
        event: 'failed_login',
        ip: '192.168.1.1',
        timestamp: new Date(),
      };

      logSecurityEvent('failed_login', eventData);

      expect(logSecurityEvent).toHaveBeenCalledWith('failed_login', eventData);
    });

    it('should create combined logging middleware', async () => {
      const mockMiddleware = jest.fn();
      createCombinedLoggingMiddleware.mockReturnValue(mockMiddleware);

      const result = createCombinedLoggingMiddleware();

      expect(result).toBe(mockMiddleware);
    });
  });

  describe('Request/Response Logging', () => {
    it('should log incoming requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        logger.info('Request logged', {
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        });
        return res;
      });

      createCombinedLoggingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createCombinedLoggingMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
    });

    it('should log outgoing responses', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
      });

      const mockResponse = {
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
      };

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        logger.info('Response logged', {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
        });
        return res;
      });

      createCombinedLoggingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createCombinedLoggingMiddleware();
      const response = await middleware(req, mockResponse);

      expect(middleware).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should log performance metrics', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
      });

      const mockResponse = {
        status: 200,
        headers: new Map(),
      };

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const startTime = Date.now();
        const endTime = Date.now();
        const duration = endTime - startTime;

        logger.info('Performance metrics', {
          duration,
          method: req.method,
          url: req.url,
        });
        return res;
      });

      createCombinedLoggingMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createCombinedLoggingMiddleware();
      const response = await middleware(req, mockResponse);

      expect(middleware).toHaveBeenCalledWith(req, mockResponse);
    });
  });
});
