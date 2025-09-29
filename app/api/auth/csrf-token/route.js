import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getCsrfTokenForUser } from '@/lib/security/csrf';
import {
  withErrorHandler,
  createSuccessResponse,
  AuthenticationError,
} from '@/lib/errors/errorHandler';

export const GET = withErrorHandler(async request => {
  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  // Verify the access token
  const decoded = verifyAccessToken(token);

  // Get or create CSRF token for user
  const csrfData = getCsrfTokenForUser(decoded.id);

  return createSuccessResponse(
    {
      csrfToken: csrfData.token,
      expiresAt: csrfData.expiresAt,
    },
    'CSRF token generated successfully'
  );
});
