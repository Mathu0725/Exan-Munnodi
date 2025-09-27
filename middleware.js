import { NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP + path)
// Note: Resets on server restart; suitable for demo/dev. Use Redis in prod.
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per window per key
const buckets = new Map(); // key -> { count, windowStart }

function rateLimitKey(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const url = new URL(request.url);
  // Group by path to avoid starving unrelated endpoints
  return `${ip}:${url.pathname}`;
}

export function middleware(request) {
  const url = new URL(request.url);

  // Enforce HTTPS in production
  const isProd = process.env.NODE_ENV === 'production';
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':','');
  if (isProd && proto !== 'https') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Prepare next response and attach security headers
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Permissions-Policy', "camera=(), microphone=(), geolocation=(), payment=()");
  // Relax CSP for dev to allow eval; tighten in production as needed
  const csp = isProd
    ? "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'"
    : "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; connect-src 'self' ws:";
  res.headers.set('Content-Security-Policy', csp);
  if (isProd) {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Rate limit API routes only
  if (url.pathname.startsWith('/api/')) {
    const key = rateLimitKey(request);
    const now = Date.now();
    const record = buckets.get(key);

    if (!record || now - record.windowStart >= WINDOW_MS) {
      buckets.set(key, { count: 1, windowStart: now });
      return res;
    }

    if (record.count >= MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again shortly.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    record.count += 1;
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};


