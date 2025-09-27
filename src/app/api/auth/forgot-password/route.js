import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        otp,
      },
    });

    try {
      await emailService.sendPasswordResetEmail(user.email, token, otp);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError.message);
      console.log(`Password reset token for ${email}: ${token}`);
    }

    return NextResponse.json({ success: true, message: 'If an account exists, reset code and link were sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process request.' }, { status: 500 });
  }
}
