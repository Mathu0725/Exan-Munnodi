import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JWTService } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { serialize } from 'cookie';

const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'Refresh token not found' 
      }, { status: 401 });
    }

    // Validate refresh token and get user
    const user = await JWTService.validateRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid refresh token' 
      }, { status: 401 });
    }

    // Check if user is still active
    if (!['Active', 'Approved'].includes(user.status)) {
      // Revoke all tokens for inactive user
      await JWTService.revokeAllUserTokens(user.id);
      return NextResponse.json({ 
        success: false, 
        message: 'Account is not active' 
      }, { status: 403 });
    }

    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = await JWTService.generateTokenPair(user);

    // Set new access token cookie
    const accessTokenCookie = serialize('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set new refresh token cookie
    const refreshTokenCookie = serialize('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({ 
      success: true, 
      data: sanitizeUser(user),
      message: 'Token refreshed successfully'
    }, { status: 200 });
    
    response.headers.set('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to refresh token' 
    }, { status: 401 });
  }
}

