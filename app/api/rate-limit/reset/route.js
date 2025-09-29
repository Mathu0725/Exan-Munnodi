import { NextResponse } from 'next/server';
import { RateLimitingUtils } from '@/lib/rateLimiting/middleware';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';

export const POST = withErrorHandler(async request => {
  const body = await request.json();
  const { identifier, type = 'ip', tier = 'api' } = body;

  if (!identifier) {
    return NextResponse.json(
      {
        success: false,
        error: 'Identifier is required',
      },
      { status: 400 }
    );
  }

  try {
    const success = await RateLimitingUtils.resetLimit(identifier, {
      type,
      tier,
    });

    if (success) {
      return createSuccessResponse(
        {
          identifier,
          type,
          tier,
          reset: true,
        },
        'Rate limit reset successfully'
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reset rate limit',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset rate limit',
        details: error.message,
      },
      { status: 500 }
    );
  }
});
