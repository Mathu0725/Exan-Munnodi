import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JWTService } from '@/lib/jwt';

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Revoke refresh token if exists
    if (refreshToken) {
      try {
        await JWTService.revokeRefreshToken(refreshToken);
      } catch (error) {
        console.error('Error revoking refresh token:', error);
      }
    }

    // Clear both cookies
    const authTokenCookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    const refreshTokenCookie = serialize('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully.' 
    });
    
    response.headers.set('Set-Cookie', [authTokenCookie, refreshTokenCookie]);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to logout.' 
    }, { status: 500 });
  }
}
