import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/connectionPool';
import { HTTP_STATUS } from '@/lib/http/statusCodes';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';

export const GET = withErrorHandler(async request => {
  const url = new URL(request.url);
  const includeHealth = url.searchParams.get('include_health') === 'true';

  try {
    // Get database metrics
    const metrics = prisma.getMetrics();

    // Get connection pool configuration
    const config = {
      maxConnections: process.env.DATABASE_MAX_CONNECTIONS || 20,
      minConnections: process.env.DATABASE_MIN_CONNECTIONS || 5,
      connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT || 10000,
      queryTimeout: process.env.DATABASE_QUERY_TIMEOUT || 30000,
    };

    let healthData = null;
    if (includeHealth) {
      healthData = await prisma.healthCheck();
    }

    const response = createSuccessResponse(
      {
        metrics: {
          ...metrics,
          timestamp: new Date().toISOString(),
        },
        config,
        health: healthData,
      },
      'Database metrics retrieved successfully'
    );

    return response;
  } catch (error) {
    return createSuccessResponse(
      {
        metrics: {
          error: 'Failed to retrieve metrics',
          timestamp: new Date().toISOString(),
        },
        config: {
          maxConnections: process.env.DATABASE_MAX_CONNECTIONS || 20,
          minConnections: process.env.DATABASE_MIN_CONNECTIONS || 5,
        },
      },
      'Database metrics retrieved with errors',
      HTTP_STATUS.OK
    );
  }
});
