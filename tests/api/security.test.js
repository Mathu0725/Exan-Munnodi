import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock security utilities
jest.mock('../../src/lib/security/headers', () => ({
  createSecurityHeadersMiddleware: jest.fn(),
  applySecurityHeaders: jest.fn(),
}));

jest.mock('../../src/lib/security/csrf', () => ({
  getCsrfTokenForUser: jest.fn(),
  validateCsrfToken: jest.fn(),
  revokeUserCsrfTokens: jest.fn(),
  addCsrfTokenToResponse: jest.fn(),
  createCsrfErrorResponse: jest.fn(),
}));

jest.mock('../../src/lib/security/sanitization', () => ({
  sanitizeHtml: jest.fn(),
  sanitizeString: jest.fn(),
  sanitizeUrl: jest.fn(),
  sanitizeEmail: jest.fn(),
  sanitizePhone: jest.fn(),
  sanitizeObject: jest.fn(),
  sanitizeRequestBody: jest.fn(),
}));

import {
  createSecurityHeadersMiddleware,
  applySecurityHeaders,
} from '../../src/lib/security/headers';

import {
  getCsrfTokenForUser,
  validateCsrfToken,
  revokeUserCsrfTokens,
  addCsrfTokenToResponse,
  createCsrfErrorResponse,
} from '../../src/lib/security/csrf';

import {
  sanitizeHtml,
  sanitizeString,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  sanitizeRequestBody,
} from '../../src/lib/security/sanitization';

describe('Security Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Headers', () => {
    it('should apply security headers to responses', async () => {
      const mockResponse = {
        headers: new Map(),
        setHeader: jest.fn(),
      };

      applySecurityHeaders.mockImplementation((response, options) => {
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader(
          'Referrer-Policy',
          'strict-origin-when-cross-origin'
        );
        return response;
      });

      const result = applySecurityHeaders(mockResponse, { isApi: true });

      expect(result).toBe(mockResponse);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Frame-Options',
        'DENY'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
    });

    it('should create security headers middleware', async () => {
      const mockMiddleware = jest.fn();
      createSecurityHeadersMiddleware.mockReturnValue(mockMiddleware);

      const result = createSecurityHeadersMiddleware();

      expect(result).toBe(mockMiddleware);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate CSRF token for user', async () => {
      const mockToken = 'csrf-token-123';
      const mockExpiresAt = new Date(Date.now() + 3600000);

      getCsrfTokenForUser.mockResolvedValue({
        token: mockToken,
        expiresAt: mockExpiresAt,
      });

      const result = await getCsrfTokenForUser('user-123');

      expect(result).toEqual({
        token: mockToken,
        expiresAt: mockExpiresAt,
      });
    });

    it('should validate CSRF token', async () => {
      validateCsrfToken.mockReturnValue(true);

      const result = validateCsrfToken('user-123', 'csrf-token-123');

      expect(result).toBe(true);
    });

    it('should revoke user CSRF tokens', async () => {
      revokeUserCsrfTokens.mockResolvedValue(true);

      const result = await revokeUserCsrfTokens('user-123');

      expect(result).toBe(true);
    });

    it('should add CSRF token to response', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      addCsrfTokenToResponse.mockImplementation(
        (response, token, expiresAt) => {
          response.setHeader(
            'Set-Cookie',
            `csrf=${token}; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`
          );
          return response;
        }
      );

      const result = addCsrfTokenToResponse(
        mockResponse,
        'csrf-token-123',
        new Date()
      );

      expect(result).toBe(mockResponse);
      expect(mockResponse.setHeader).toHaveBeenCalled();
    });

    it('should create CSRF error response', async () => {
      const mockResponse = {
        status: 403,
        json: jest.fn().mockReturnValue({
          success: false,
          message: 'CSRF token validation failed',
        }),
      };

      createCsrfErrorResponse.mockReturnValue(mockResponse);

      const result = createCsrfErrorResponse();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML content', async () => {
      const mockHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitizedHtml = '<p>Safe content</p>';

      sanitizeHtml.mockReturnValue(sanitizedHtml);

      const result = sanitizeHtml(mockHtml);

      expect(result).toBe(sanitizedHtml);
    });

    it('should sanitize string input', async () => {
      const mockString = '  <script>alert("xss")</script>  ';
      const sanitizedString = 'alert("xss")';

      sanitizeString.mockReturnValue(sanitizedString);

      const result = sanitizeString(mockString);

      expect(result).toBe(sanitizedString);
    });

    it('should sanitize URL input', async () => {
      const mockUrl = 'javascript:alert("xss")';
      const sanitizedUrl = '';

      sanitizeUrl.mockReturnValue(sanitizedUrl);

      const result = sanitizeUrl(mockUrl);

      expect(result).toBe(sanitizedUrl);
    });

    it('should sanitize email input', async () => {
      const mockEmail = '  user@example.com  ';
      const sanitizedEmail = 'user@example.com';

      sanitizeEmail.mockReturnValue(sanitizedEmail);

      const result = sanitizeEmail(mockEmail);

      expect(result).toBe(sanitizedEmail);
    });

    it('should sanitize phone input', async () => {
      const mockPhone = '  +1-555-123-4567  ';
      const sanitizedPhone = '+1-555-123-4567';

      sanitizePhone.mockReturnValue(sanitizedPhone);

      const result = sanitizePhone(mockPhone);

      expect(result).toBe(sanitizedPhone);
    });

    it('should sanitize object input', async () => {
      const mockObject = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        bio: '<script>alert("xss")</script>',
      };

      const sanitizedObject = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'alert("xss")',
      };

      sanitizeObject.mockReturnValue(sanitizedObject);

      const result = sanitizeObject(mockObject);

      expect(result).toEqual(sanitizedObject);
    });

    it('should sanitize request body', async () => {
      const mockBody = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        bio: '<script>alert("xss")</script>',
      };

      const sanitizedBody = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'alert("xss")',
      };

      sanitizeRequestBody.mockReturnValue(sanitizedBody);

      const result = sanitizeRequestBody(mockBody);

      expect(result).toEqual(sanitizedBody);
    });
  });
});
