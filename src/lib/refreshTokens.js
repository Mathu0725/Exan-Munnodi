import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function issueRefreshTokenForUser(user, context = {}) {
  const plain = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(plain);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      device: context.device || null,
      ipAddress: context.ipAddress || null,
    },
  });

  return { plain, expiresAt };
}

export async function rotateRefreshToken(oldPlainToken, user, context = {}) {
  const oldHash = hashToken(oldPlainToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
  });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }

  const { plain: newPlain, expiresAt } = await issueRefreshTokenForUser(
    user,
    context
  );

  await prisma.refreshToken.update({
    where: { tokenHash: oldHash },
    data: {
      revokedAt: new Date(),
      replacedByToken: hashToken(newPlain),
    },
  });

  return { newPlain, expiresAt };
}

export function buildAuthCookies({
  accessToken,
  accessExpiresInSec,
  refreshToken,
  refreshExpiresAt,
}) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieParts = [];

  // Access token cookie - more restrictive
  cookieParts.push(
    `auth_token=${accessToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${accessExpiresInSec}${isProduction ? '; Secure' : ''}`
  );

  if (refreshToken) {
    const refreshMaxAge = Math.max(
      1,
      Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000)
    );
    // Refresh token cookie - even more restrictive (only for auth endpoints)
    cookieParts.push(
      `refresh_token=${refreshToken}; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=${refreshMaxAge}${isProduction ? '; Secure' : ''}`
    );
  }

  return cookieParts;
}
