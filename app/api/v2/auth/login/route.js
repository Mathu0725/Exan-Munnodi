import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { signAccessToken } from '@/lib/jwt';
import {
  issueRefreshTokenForUser,
  buildAuthCookies,
} from '@/lib/refreshTokens';
import { checkLoginLockout, recordLoginAttempt } from '@/lib/loginLockout';
import { authSchemas } from '@/lib/validations/schemas';
import {
  validateBody,
  createValidationErrorResponse,
  sanitizeInput,
} from '@/lib/validations/middleware';
import {
  withErrorHandler,
  AuthenticationError,
  RateLimitError,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';
import {
  getCsrfTokenForUser,
  addCsrfTokenToResponse,
} from '@/lib/security/csrf';
import { logAuthEvent, logSecurityEvent } from '@/lib/logger/requestLogger';
import { addVersionHeaders } from '@/lib/api/versioning';

const sanitizeUser = user => {
  const { password, ...safe } = user;
  return safe;
};

export const POST = withErrorHandler(async request => {
  const body = await request.json();

  // Validate request body
  const validation = validateBody(authSchemas.login, body);
  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  const { email, password } = sanitizeInput(validation.data);

  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent');

  // Check for lockout before processing
  const lockoutCheck = await checkLoginLockout(email, ipAddress);
  if (lockoutCheck.locked) {
    logSecurityEvent('login_lockout', { email, ipAddress, userAgent });
    throw new RateLimitError(lockoutCheck.message);
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
    include: {
      profile: true,
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!user) {
    await recordLoginAttempt(email, ipAddress, userAgent, false);
    logSecurityEvent('login_failed_user_not_found', {
      email,
      ipAddress,
      userAgent,
    });
    throw new AuthenticationError('Invalid email or password.');
  }

  // Allow Active and Approved. Block others with clearer messages.
  const status = user.status;
  if (!['Active', 'Approved'].includes(status)) {
    await recordLoginAttempt(email, ipAddress, userAgent, false);
    const statusMessage =
      status === 'Inactive'
        ? 'Your account is inactive. Please contact the administrator.'
        : status === 'Pending'
          ? 'Your account is pending approval by an administrator.'
          : status === 'Suspended'
            ? 'Your account is suspended. Please contact the administrator.'
            : `Account not active. Current status: ${status}.`;
    throw new AuthenticationError(statusMessage);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    await recordLoginAttempt(email, ipAddress, userAgent, false);
    logSecurityEvent('login_failed_invalid_password', {
      email,
      ipAddress,
      userAgent,
      userId: user.id,
    });
    throw new AuthenticationError('Invalid email or password.');
  }

  // Create access token (15 minutes)
  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  // Record successful login attempt
  await recordLoginAttempt(email, ipAddress, userAgent, true);
  logAuthEvent('login_success', {
    email,
    ipAddress,
    userAgent,
    userId: user.id,
    role: user.role,
  });

  // Create refresh token (30 days) and set cookies
  const { plain: refreshPlain, expiresAt: refreshExpiresAt } =
    await issueRefreshTokenForUser(user, {
      ipAddress,
      device: userAgent,
    });

  // Get CSRF token for the user
  const csrfData = getCsrfTokenForUser(user.id);

  // Set cookie
  const response = createSuccessResponse(
    {
      user: sanitizeUser(user),
      csrfToken: csrfData.token,
      csrfExpiresAt: csrfData.expiresAt,
      version: 'v2',
      features: [
        'enhanced_security',
        'csrf_protection',
        'rate_limiting',
        'improved_validation',
      ],
    },
    'Login successful'
  );

  const cookiesToSet = buildAuthCookies({
    accessToken: token,
    accessExpiresInSec: 60 * 15,
    refreshToken: refreshPlain,
    refreshExpiresAt,
  });
  response.headers.append('Set-Cookie', cookiesToSet[0]);
  response.headers.append('Set-Cookie', cookiesToSet[1]);

  // Add CSRF token cookie
  addCsrfTokenToResponse(
    response,
    csrfData.token,
    csrfData.expiresAt,
    process.env.NODE_ENV === 'production'
  );

  // Add version headers
  return addVersionHeaders('v2', response);
});
