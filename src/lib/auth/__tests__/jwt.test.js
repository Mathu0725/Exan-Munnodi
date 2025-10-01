import {
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
} from '../jwt';

// Mock the jsonwebtoken module
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'STUDENT',
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_ISSUER = 'test-issuer';
    process.env.JWT_AUDIENCE = 'test-audience';
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      jwt.sign.mockReturnValue(mockToken);

      const result = generateAccessToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          type: 'access',
        },
        'dev-secret-change-me',
        {
          expiresIn: '15m',
          issuer: 'exam-munnodi',
          audience: 'exam-munnodi-users',
        }
      );
      expect(result).toBe(mockToken);
    });

    it('should use default secret if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      jwt.sign.mockReturnValue(mockToken);

      generateAccessToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'dev-secret-change-me',
        expect.any(Object)
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload', () => {
      jwt.sign.mockReturnValue(mockToken);

      const result = generateRefreshToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          type: 'refresh',
        },
        'dev-secret-change-me',
        {
          expiresIn: '7d',
          issuer: 'exam-munnodi',
          audience: 'exam-munnodi-users',
        }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const decodedPayload = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        iss: 'test-issuer',
        aud: 'test-audience',
      };

      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyAccessToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        'dev-secret-change-me',
        {
          issuer: 'exam-munnodi',
          audience: 'exam-munnodi-users',
        }
      );
      expect(result).toEqual(decodedPayload);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyAccessToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw error for token with wrong issuer', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid issuer');
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw error for token with wrong audience', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid audience');
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        'Invalid or expired token'
      );
    });
  });
});
