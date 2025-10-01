import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { serialize } from 'cookie';

const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
      include: {
        profile: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    // Allow Active and Approved. Block others with clearer messages.
    const status = user.status;
    if (!['Active', 'Approved'].includes(status)) {
      const statusMessage =
        status === 'Inactive'
          ? 'Your account is inactive. Please contact the administrator.'
          : status === 'Pending'
          ? 'Your account is pending approval by an administrator.'
          : status === 'Suspended'
          ? 'Your account is suspended. Please contact the administrator.'
          : `Account not active. Current status: ${status}.`;
      return NextResponse.json({ success: false, message: statusMessage }, { status: 403 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    // Generate token pair
    const { accessToken, refreshToken } = await JWTService.generateTokenPair(user);

    // Set access token cookie (short-lived)
    const accessTokenCookie = serialize('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set refresh token cookie (long-lived)
    const refreshTokenCookie = serialize('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({ 
      success: true, 
      data: sanitizeUser(user),
      message: 'Login successful'
    }, { status: 200 });
    
    response.headers.set('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Failed to login.' }, { status: 500 });
  }
}
