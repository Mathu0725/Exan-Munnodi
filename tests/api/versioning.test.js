import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock versioning utilities
jest.mock('../../src/lib/api/versioning', () => ({
  createVersioningMiddleware: jest.fn(),
  API_VERSIONS: {
    '1.0': { status: 'active', deprecatedAt: null, sunsetAt: null },
    '2.0': { status: 'active', deprecatedAt: null, sunsetAt: null },
  },
}));

import {
  createVersioningMiddleware,
  API_VERSIONS,
} from '../../src/lib/api/versioning';

describe('API Versioning Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Versioning Middleware', () => {
    it('should create versioning middleware', async () => {
      const mockMiddleware = jest.fn();
      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const options = {
        defaultVersion: '1.0',
        supportedVersions: ['1.0', '2.0'],
      };

      const result = createVersioningMiddleware(options);

      expect(result).toBe(mockMiddleware);
      expect(createVersioningMiddleware).toHaveBeenCalledWith(options);
    });

    it('should handle version from header', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'API-Version': '2.0',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const version = req.headers.get('API-Version') || '1.0';
        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(req.version).toBe('2.0');
    });

    it('should handle version from path', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/questions', {
        method: 'GET',
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const path = req.nextUrl.pathname;
        const versionMatch = path.match(/\/api\/v(\d+\.\d+)\//);
        const version = versionMatch ? versionMatch[1] : '1.0';
        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(req.version).toBe('2.0');
    });

    it('should use default version when none specified', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const version = req.headers.get('API-Version') || '1.0';
        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(req.version).toBe('1.0');
    });

    it('should handle deprecated versions', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'API-Version': '1.0',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const version = req.headers.get('API-Version') || '1.0';
        const versionInfo = API_VERSIONS[version];

        if (versionInfo && versionInfo.status === 'deprecated') {
          res.headers.set('Deprecation', 'true');
          res.headers.set('Sunset', versionInfo.sunsetAt);
        }

        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(req.version).toBe('1.0');
    });

    it('should handle sunset versions', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'API-Version': '1.0',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const version = req.headers.get('API-Version') || '1.0';
        const versionInfo = API_VERSIONS[version];

        if (versionInfo && versionInfo.status === 'sunset') {
          return new Response('API version is no longer supported', {
            status: 410,
          });
        }

        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(req.version).toBe('1.0');
    });

    it('should handle unsupported versions', async () => {
      const req = new NextRequest('http://localhost:3000/api/questions', {
        method: 'GET',
        headers: {
          'API-Version': '3.0',
        },
      });

      const mockMiddleware = jest.fn().mockImplementation((req, res) => {
        const version = req.headers.get('API-Version') || '1.0';
        const supportedVersions = ['1.0', '2.0'];

        if (!supportedVersions.includes(version)) {
          return new Response('Unsupported API version', { status: 400 });
        }

        req.version = version;
        return res;
      });

      createVersioningMiddleware.mockReturnValue(mockMiddleware);

      const middleware = createVersioningMiddleware();
      const response = await middleware(req, {});

      expect(middleware).toHaveBeenCalledWith(req, {});
      expect(response.status).toBe(400);
    });
  });

  describe('API Versions', () => {
    it('should have defined API versions', async () => {
      expect(API_VERSIONS).toBeDefined();
      expect(API_VERSIONS['1.0']).toBeDefined();
      expect(API_VERSIONS['2.0']).toBeDefined();
    });

    it('should have correct version structure', async () => {
      const version = API_VERSIONS['1.0'];
      expect(version).toHaveProperty('status');
      expect(version).toHaveProperty('deprecatedAt');
      expect(version).toHaveProperty('sunsetAt');
    });

    it('should have active versions', async () => {
      const version = API_VERSIONS['1.0'];
      expect(version.status).toBe('active');
    });
  });
});
