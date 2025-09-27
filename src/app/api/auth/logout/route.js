import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookie = serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0), // Expire the cookie immediately
      path: '/',
    });

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Failed to logout.' }, { status: 500 });
  }
}
