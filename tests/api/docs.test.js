import { createMocks } from 'node-mocks-http';
import { GET as getDocsHandler } from '../../app/api/docs/route';
import { GET as getOpenApiHandler } from '../../app/api/openapi.json/route';

describe('Documentation API Routes', () => {
  describe('GET /api/docs', () => {
    it('should return Swagger UI HTML', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getDocsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toContain('<!DOCTYPE html>');
      expect(data).toContain('swagger-ui');
      expect(data).toContain('OpenAPI');
    });

    it('should include Swagger UI CSS and JS', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getDocsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toContain('swagger-ui-bundle.js');
      expect(data).toContain('swagger-ui-standalone-preset.js');
      expect(data).toContain('swagger-ui.css');
    });
  });

  describe('GET /api/openapi.json', () => {
    it('should return OpenAPI specification', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getOpenApiHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.openapi).toBeDefined();
      expect(data.info).toBeDefined();
      expect(data.paths).toBeDefined();
    });

    it('should include API information', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getOpenApiHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.info.title).toBeDefined();
      expect(data.info.version).toBeDefined();
      expect(data.info.description).toBeDefined();
    });

    it('should include security schemes', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getOpenApiHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.components).toBeDefined();
      expect(data.components.securitySchemes).toBeDefined();
    });
  });
});
