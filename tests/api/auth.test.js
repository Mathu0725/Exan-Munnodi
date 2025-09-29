import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import { POST as loginHandler } from '../../app/api/auth/login/route';
import { POST as registerHandler } from '../../app/api/auth/register/route';
import { POST as logoutHandler } from '../../app/api/auth/logout/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  loginAttempt: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: 'STUDENT',
        status: 'APPROVED',
      };

      const mockLoginAttempt = null;

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.loginAttempt.findFirst.mockResolvedValue(mockLoginAttempt);
      prisma.loginAttempt.create.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('should return error for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid credentials');
    });

    it('should return error for pending user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: 'STUDENT',
        status: 'PENDING',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Account pending approval');
    });

    it('should return error for missing email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          password: 'password123',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Email is required');
    });

    it('should return error for missing password', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Password is required');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'STUDENT',
        status: 'PENDING',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'STUDENT',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('should return error for existing email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'STUDENT',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Email already exists');
    });

    it('should return error for password mismatch', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword',
          role: 'STUDENT',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain("Passwords don't match");
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      prisma.refreshToken.update.mockResolvedValue({});

      const { req, res } = createMocks({
        method: 'POST',
        cookies: {
          auth_token: 'valid-token',
          refresh_token: 'valid-refresh-token',
        },
      });

      await logoutHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.message).toContain('Logged out successfully');
    });

    it('should handle logout without tokens', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        cookies: {},
      });

      await logoutHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });
});
