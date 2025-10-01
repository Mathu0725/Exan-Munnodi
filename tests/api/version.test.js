import { createMocks } from 'node-mocks-http';
import { GET as getVersionHandler } from '../../app/api/version/route';

describe('Version API Routes', () => {
  describe('GET /api/version', () => {
    it('should return API version information', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getVersionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.versions).toBeDefined();
      expect(Array.isArray(data.data.versions)).toBe(true);
      expect(data.data.versions.length).toBeGreaterThan(0);
    });

    it('should include version details', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getVersionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);

      const versions = data.data.versions;
      expect(versions[0]).toHaveProperty('version');
      expect(versions[0]).toHaveProperty('status');
      expect(versions[0]).toHaveProperty('deprecatedAt');
      expect(versions[0]).toHaveProperty('sunsetAt');
    });

    it('should include current version', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getVersionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.currentVersion).toBeDefined();
    });
  });
});
