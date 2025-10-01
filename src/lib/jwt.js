import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim().length === 0) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

const DEFAULT_ISSUER = process.env.JWT_ISSUER || 'exam-munnodi';
const DEFAULT_AUDIENCE = process.env.JWT_AUDIENCE || 'exam-munnodi-users';

export function signAccessToken(payload, options = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '15m',
    issuer: options.issuer ?? DEFAULT_ISSUER,
    audience: options.audience ?? DEFAULT_AUDIENCE,
    ...options,
  });
}

export function verifyAccessToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret, {
    issuer: DEFAULT_ISSUER,
    audience: DEFAULT_AUDIENCE,
  });
}

export function signRefreshToken(payload, options = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: options.expiresIn ?? '30d',
    issuer: options.issuer ?? DEFAULT_ISSUER,
    audience: options.audience ?? DEFAULT_AUDIENCE,
    ...options,
  });
}
