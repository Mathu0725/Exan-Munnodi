import { NextResponse } from 'next/server';
import { RateLimitingUtils } from '@/lib/rateLimiting/middleware';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';

export const GET = withErrorHandler(async request => {
  try {
    const stats = await RateLimitingUtils.getStats();

    return createSuccessResponse(
      {
        stats,
        available: RateLimitingUtils.isAvailable(),
        timestamp: new Date().toISOString(),
      },
      'Rate limiter statistics retrieved successfully'
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get rate limiter statistics',
        details: error.message,
      },
      { status: 500 }
    );
  }
});
