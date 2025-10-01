import { createMocks } from 'node-mocks-http';
import { GET as getCsrfTokenHandler } from '../../app/api/auth/csrf-token/route';

// Mock CSRF utilities
jest.mock('../../src/lib/security/csrf', () => ({
  getCsrfTokenForUser: jest.fn(),
  addCsrfTokenToResponse: jest.fn(),
}));

import {
  getCsrfTokenForUser,
  addCsrfTokenToResponse,
} from '../../src/lib/security/csrf';

describe('CSRF API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/csrf-token', () => {
    it('should return CSRF token for authenticated user', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      getCsrfTokenForUser.mockResolvedValue({
        token: mockToken,
        expiresAt: mockExpiresAt,
      });

      addCsrfTokenToResponse.mockImplementation(
        (response, token, expiresAt) => {
          response.setHeader(
            'Set-Cookie',
            `csrf=${token}; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
          );
          return response;
        }
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          cookie: 'auth=valid-jwt-token',
        },
      });

      await getCsrfTokenHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.csrfToken).toBe(mockToken);
      expect(data.data.csrfExpiresAt).toBe(mockExpiresAt.toISOString());
    });

    it('should return error for unauthenticated user', async () => {
      getCsrfTokenForUser.mockRejectedValue(
        new Error('User not authenticated')
      );

      const { req, res } = createMocks({
        method: 'GET',
      });

      await getCsrfTokenHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Authentication required');
    });

    it('should return error when CSRF token generation fails', async () => {
      getCsrfTokenForUser.mockRejectedValue(
        new Error('CSRF token generation failed')
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          cookie: 'auth=valid-jwt-token',
        },
      });

      await getCsrfTokenHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Failed to generate CSRF token');
    });

    it('should set CSRF cookie in response', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiresAt = new Date(Date.now() + 3600000);

      getCsrfTokenForUser.mockResolvedValue({
        token: mockToken,
        expiresAt: mockExpiresAt,
      });

      addCsrfTokenToResponse.mockImplementation(
        (response, token, expiresAt) => {
          response.setHeader(
            'Set-Cookie',
            `csrf=${token}; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
          );
          return response;
        }
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          cookie: 'auth=valid-jwt-token',
        },
      });

      await getCsrfTokenHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(addCsrfTokenToResponse).toHaveBeenCalledWith(
        expect.any(Object),
        mockToken,
        mockExpiresAt
      );
    });
  });
});
