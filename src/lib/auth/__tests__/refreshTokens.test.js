import { hashToken, verifyTokenHash } from '../refreshTokens';
import crypto from 'crypto';

// Mock crypto module
jest.mock('crypto');

describe('Refresh Token Utilities', () => {
  const mockToken = 'mock-refresh-token';
  const mockHashedToken = 'hashed-refresh-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashToken', () => {
    it('should hash token using SHA-256', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken),
      });

      const result = hashToken(mockToken);

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(result).toBe(mockHashedToken);
    });

    it('should handle empty token', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(''),
      });

      const result = hashToken('');

      expect(result).toBe('');
    });
  });

  describe('verifyTokenHash', () => {
    it('should verify matching tokens', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken),
      });
      crypto.timingSafeEqual.mockReturnValue(true);

      const result = verifyTokenHash(mockToken, mockHashedToken);

      expect(result).toBe(true);
    });

    it('should return false for non-matching tokens', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('different-hash'),
      });
      crypto.timingSafeEqual.mockReturnValue(false);

      const result = verifyTokenHash(mockToken, mockHashedToken);

      expect(result).toBe(false);
    });

    it('should handle null or undefined tokens', () => {
      expect(() => verifyTokenHash(null, mockHashedToken)).toThrow();
      expect(() => verifyTokenHash(mockToken, null)).toThrow();
      expect(() => verifyTokenHash(undefined, mockHashedToken)).toThrow();
      expect(() => verifyTokenHash(mockToken, undefined)).toThrow();
    });
  });
});
