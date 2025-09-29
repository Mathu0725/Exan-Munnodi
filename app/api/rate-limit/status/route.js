import { NextResponse } from 'next/server';
import { RateLimitingUtils } from '@/lib/rateLimiting/middleware';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';

export const GET = withErrorHandler(async request => {
  const url = new URL(request.url);
  const identifier = url.searchParams.get('identifier');
  const type = url.searchParams.get('type') || 'ip';
  const tier = url.searchParams.get('tier') || 'api';

  if (!identifier) {
    return NextResponse.json(
      {
        success: false,
        error: 'Identifier parameter is required',
      },
      { status: 400 }
    );
  }

  try {
    const status = await RateLimitingUtils.getStatus(identifier, {
      type,
      tier,
    });

    return createSuccessResponse(
      {
        identifier,
        type,
        tier,
        status,
        available: RateLimitingUtils.isAvailable(),
      },
      'Rate limit status retrieved successfully'
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get rate limit status',
        details: error.message,
      },
      { status: 500 }
    );
  }
});
