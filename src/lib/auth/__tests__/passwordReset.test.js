import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  verifyPasswordResetToken,
} from '../passwordReset';
import crypto from 'crypto';

// Mock crypto module
jest.mock('crypto');

describe('Password Reset Token Utilities', () => {
  const mockToken = 'mock-reset-token';
  const mockHashedToken = 'hashed-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPasswordResetToken', () => {
    it('should hash password reset token', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken),
      });

      const result = hashPasswordResetToken(mockToken);

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(result).toBe(mockHashedToken);
    });

    it('should handle empty token', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(''),
      });

      const result = hashPasswordResetToken('');

      expect(result).toBe('');
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate random token', () => {
      crypto.randomBytes.mockReturnValue(Buffer.from('random-bytes'));

      const result = generatePasswordResetToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result).toBe('72616e646f6d2d6279746573'); // hex of 'random-bytes'
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should verify matching tokens', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken),
      });
      crypto.timingSafeEqual.mockReturnValue(true);

      const result = verifyPasswordResetToken(mockToken, mockHashedToken);

      expect(result).toBe(true);
    });

    it('should return false for non-matching tokens', () => {
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('different-hash'),
      });
      crypto.timingSafeEqual.mockReturnValue(false);

      const result = verifyPasswordResetToken(mockToken, mockHashedToken);

      expect(result).toBe(false);
    });

    it('should handle null or undefined tokens', () => {
      expect(() => verifyPasswordResetToken(null, mockHashedToken)).toThrow();
      expect(() => verifyPasswordResetToken(mockToken, null)).toThrow();
      expect(() =>
        verifyPasswordResetToken(undefined, mockHashedToken)
      ).toThrow();
      expect(() => verifyPasswordResetToken(mockToken, undefined)).toThrow();
    });
  });
});
