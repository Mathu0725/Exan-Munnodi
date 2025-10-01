import crypto from 'crypto';

/**
 * Generate a password reset token
 * @returns {string} Random password reset token
 */
export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password reset token for secure storage
 * @param {string} token - Raw password reset token
 * @returns {string} Hashed token
 */
export function hashPasswordResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a password reset token against its hash
 * @param {string} token - Raw password reset token
 * @param {string} hashedToken - Stored hashed token
 * @returns {boolean} True if token matches hash
 */
export function verifyPasswordResetToken(token, hashedToken) {
  if (!token || !hashedToken) {
    throw new Error('Token and hashed token are required');
  }

  const tokenHash = hashPasswordResetToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(hashedToken, 'hex')
  );
}

export default {
  generatePasswordResetToken,
  hashPasswordResetToken,
  verifyPasswordResetToken,
};
