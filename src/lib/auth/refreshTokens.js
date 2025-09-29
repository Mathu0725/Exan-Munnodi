import crypto from 'crypto';

/**
 * Hash a refresh token for secure storage
 * @param {string} token - Raw refresh token
 * @returns {string} Hashed token
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a refresh token against its hash
 * @param {string} token - Raw refresh token
 * @param {string} hashedToken - Stored hashed token
 * @returns {boolean} True if token matches hash
 */
export function verifyTokenHash(token, hashedToken) {
  if (!token || !hashedToken) {
    throw new Error('Token and hashed token are required');
  }

  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(hashedToken, 'hex')
  );
}

export default {
  hashToken,
  verifyTokenHash,
};
