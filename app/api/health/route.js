import { NextResponse } from 'next/server';
import { performHealthCheck, quickHealthCheck } from '@/lib/health/healthCheck';
import { HTTP_STATUS } from '@/lib/http/statusCodes';

export const GET = async request => {
  try {
    const url = new URL(request.url);
    const quick = url.searchParams.get('quick') === 'true';

    let healthData;
    let statusCode = HTTP_STATUS.OK;

    if (quick) {
      healthData = await quickHealthCheck();
      if (healthData.status === 'error') {
        statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
      }
    } else {
      healthData = await performHealthCheck({
        includeDatabase: true,
        includeMemory: true,
        includeDisk: true,
        includeUptime: true,
        includeEnvironment: true,
      });

      if (healthData.status === 'unhealthy') {
        statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
      } else if (healthData.status === 'degraded') {
        statusCode = HTTP_STATUS.OK; // Still operational but degraded
      }
    }

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error.message,
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'true',
        },
      }
    );
  }
};
