import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  hashToken,
  rotateRefreshToken,
  buildAuthCookies,
} from '@/lib/refreshTokens';
import { signAccessToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const refreshPlain = cookieStore.get('refresh_token')?.value;

    if (!refreshPlain) {
      return NextResponse.json(
        { success: false, message: 'Missing refresh token' },
        { status: 401 }
      );
    }

    const tokenHash = hashToken(refreshPlain);
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || !['Active', 'Approved'].includes(user.status)) {
      return NextResponse.json(
        { success: false, message: 'User not active' },
        { status: 403 }
      );
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    const { newPlain, expiresAt } = await rotateRefreshToken(
      refreshPlain,
      user,
      {
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        device: request.headers.get('user-agent') || undefined,
      }
    );

    const response = NextResponse.json({ success: true }, { status: 200 });
    const cookiesToSet = buildAuthCookies({
      accessToken,
      accessExpiresInSec: 60 * 15,
      refreshToken: newPlain,
      refreshExpiresAt: expiresAt,
    });
    response.headers.append('Set-Cookie', cookiesToSet[0]);
    response.headers.append('Set-Cookie', cookiesToSet[1]);
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
