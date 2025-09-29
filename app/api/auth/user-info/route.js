import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const sanitizeUser = user => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: 'id or email query parameter required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          id ? { id: Number(id) } : undefined,
          email ? { email: email.toLowerCase() } : undefined,
        ].filter(Boolean),
      },
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

    return NextResponse.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('User info error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user.' },
      { status: 500 }
    );
  }
}
