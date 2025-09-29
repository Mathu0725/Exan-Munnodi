import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashToken } from '@/lib/refreshTokens';
import { revokeUserCsrfTokens } from '@/lib/security/csrf';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';
import { verifyAccessToken } from '@/lib/jwt';
import { logAuthEvent } from '@/lib/logger/requestLogger';

export const POST = withErrorHandler(async () => {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  // Get user ID from token for CSRF cleanup
  let userId = null;
  if (authToken) {
    try {
      const decoded = verifyAccessToken(authToken);
      userId = decoded.id;
    } catch (error) {
      // Token is invalid, continue with logout
    }
  }

  // Revoke refresh token if present
  try {
    const refreshPlain = cookieStore.get('refresh_token')?.value;
    if (refreshPlain) {
      const tokenHash = hashToken(refreshPlain);
      await prisma.refreshToken.update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }
  } catch (error) {
    // Continue with logout even if refresh token revocation fails
  }

  // Revoke all CSRF tokens for the user
  if (userId) {
    revokeUserCsrfTokens(userId);
    logAuthEvent('logout_success', { userId });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    expires: new Date(0), // Expire the cookie immediately
    path: '/',
  });

  const refresh = serialize('refresh_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    expires: new Date(0),
    path: '/api/auth',
  });

  const csrf = serialize('csrf-token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  const response = createSuccessResponse(null, 'Logged out successfully');
  response.headers.append('Set-Cookie', cookie);
  response.headers.append('Set-Cookie', refresh);
  response.headers.append('Set-Cookie', csrf);

  return response;
});
