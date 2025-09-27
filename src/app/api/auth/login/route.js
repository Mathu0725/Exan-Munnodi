import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET || 'e933e3c8e4e4a7b4a2e5d1f8a7c6b3e2a1d0c9f8b7e6a5d4c3b2a1f0e9d8c7b6',
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const response = NextResponse.json({ success: true, data: sanitizeUser(user) }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Failed to login.' }, { status: 500 });
  }
}
