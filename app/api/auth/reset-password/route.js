import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
// plain JS date checks; no external deps
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token, password, otp } = await request.json();

    if (!token || !password || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token, OTP, and new password are required.',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters.' },
        { status: 422 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      new Date(resetToken.expiresAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token.' },
        { status: 400 }
      );
    }

    if ((resetToken.otp || '').trim() !== String(otp).trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP code.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
