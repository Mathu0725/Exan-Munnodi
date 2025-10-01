import { NextResponse } from 'next/server';
import { quickHealthCheck } from '@/lib/health/healthCheck';
import { HTTP_STATUS } from '@/lib/http/statusCodes';

export const GET = async () => {
  try {
    const statusData = await quickHealthCheck();

    return NextResponse.json(statusData, {
      status:
        statusData.status === 'ok'
          ? HTTP_STATUS.OK
          : HTTP_STATUS.SERVICE_UNAVAILABLE,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Status-Check': 'true',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Status check failed',
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Status-Check': 'true',
        },
      }
    );
  }
};
