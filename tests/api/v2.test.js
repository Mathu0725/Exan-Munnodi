import { createMocks } from 'node-mocks-http';
import { GET as getV2AuthLoginHandler } from '../../app/api/v2/auth/login/route';
import { GET as getV2QuestionsHandler } from '../../app/api/v2/questions/route';

describe('API v2 Routes', () => {
  describe('GET /api/v2/auth/login', () => {
    it('should return v2 login endpoint info', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getV2AuthLoginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.message).toContain('API v2 login endpoint');
    });
  });

  describe('GET /api/v2/questions', () => {
    it('should return v2 questions endpoint info', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await getV2QuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.message).toContain('API v2 questions endpoint');
    });
  });
});
