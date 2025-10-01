import { NextResponse } from 'next/server';
import {
  isOriginAllowed,
  getCorsHeaders,
  createCorsErrorResponse,
  createCorsPreflightResponse,
} from '@/lib/cors';
import {
  applySecurityHeaders,
  createSecurityHeadersMiddleware,
} from '@/lib/security/headers';
import { createCombinedLoggingMiddleware } from '@/lib/middleware/requestLogger';
import { createVersioningMiddleware } from '@/lib/api/versioning';
import { createRateLimitingMiddleware } from '@/lib/rateLimiting/middleware';
import '@/lib/startup';

// Simple in-memory rate limiter (per IP + path)
// Note: Resets on server restart; suitable for demo/dev. Use Redis in prod.
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per window per key
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes for auth endpoints
const AUTH_MAX_REQUESTS = 5; // per window for auth endpoints
const buckets = new Map(); // key -> { count, windowStart }

function rateLimitKey(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  const url = new URL(request.url);
  // Group by path to avoid starving unrelated endpoints
  return `${ip}:${url.pathname}`;
}

function setCorsHeaders(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Create logging middleware
const loggingMiddleware = createCombinedLoggingMiddleware({
  requestLogger: {
    logRequestBody: process.env.NODE_ENV === 'development',
    logResponseBody: process.env.NODE_ENV === 'development',
    logHeaders: false,
    skipPaths: ['/api/health', '/api/status', '/api/version'],
    maxBodySize: 1024,
  },
  performance: {
    slowRequestThreshold: 1000,
    logSlowRequests: true,
  },
  requestId: {
    headerName: 'X-Request-ID',
  },
  security: {
    logSuspiciousActivity: true,
  },
});

// Create versioning middleware
const versioningMiddleware = createVersioningMiddleware({
  enforceVersion: false, // Allow unversioned requests to default to v1
  allowUnversioned: true,
  defaultVersion: 'v1',
  rejectDeprecated: false,
  rejectSunset: true,
});

// Create Redis rate limiting middleware
const redisRateLimitingMiddleware = createRateLimitingMiddleware({
  skipPaths: ['/api/health', '/api/status', '/api/version', '/api/docs'],
  skipMethods: ['OPTIONS'],
  onLimitReached: (request, rateLimitResult) => {
    // Log rate limit violations
    console.warn('Rate limit exceeded', {
      url: request.url,
      identifier: rateLimitResult.identifier,
      type: rateLimitResult.type,
      tier: rateLimitResult.tier,
      retryAfter: rateLimitResult.retryAfter,
    });
  },
});

export function middleware(request) {
  return loggingMiddleware(request, async () => {
    return versioningMiddleware(request, async () => {
      return redisRateLimitingMiddleware(request, async () => {
        const url = new URL(request.url);
        const origin = request.headers.get('origin');

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
          return createCorsPreflightResponse(origin);
        }

        // Check CORS for API routes
        if (url.pathname.startsWith('/api/')) {
          if (origin && !isOriginAllowed(origin)) {
            return createCorsErrorResponse();
          }
        }

        // Enforce HTTPS in production
        const isProd = process.env.NODE_ENV === 'production';
        const proto =
          request.headers.get('x-forwarded-proto') ||
          url.protocol.replace(':', '');
        if (isProd && proto !== 'https') {
          url.protocol = 'https:';
          return NextResponse.redirect(url, 301);
        }

        // Prepare next response and attach security headers
        const res = NextResponse.next();

        // Apply comprehensive security headers
        const securityMiddleware = createSecurityHeadersMiddleware();
        const securityContext = securityMiddleware(request);

        applySecurityHeaders(res, {
          isProduction: isProd,
          isApi: securityContext.isApi,
          isStatic: securityContext.isStatic,
          cspOptions: securityContext.cspOptions,
        });

        // Set CORS headers for API routes
        if (url.pathname.startsWith('/api/')) {
          setCorsHeaders(res, origin);
        }

        // Legacy in-memory rate limiting as fallback (kept for compatibility)
        if (url.pathname.startsWith('/api/')) {
          const key = rateLimitKey(request);
          const now = Date.now();
          const record = buckets.get(key);

          // Check if this is an auth endpoint
          const isAuthEndpoint = url.pathname.startsWith('/api/auth/');
          const windowMs = isAuthEndpoint ? AUTH_WINDOW_MS : WINDOW_MS;
          const maxRequests = isAuthEndpoint ? AUTH_MAX_REQUESTS : MAX_REQUESTS;

          if (!record || now - record.windowStart >= windowMs) {
            buckets.set(key, { count: 1, windowStart: now });
            return res;
          }

          if (record.count >= maxRequests) {
            const message = isAuthEndpoint
              ? 'Too many authentication attempts. Please try again in 15 minutes.'
              : 'Too many requests. Please try again shortly.';

            return new NextResponse(JSON.stringify({ error: message }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          record.count += 1;
        }

        return res;
      });
    });
  });
}

export const config = {
  matcher: ['/api/:path*'],
};
