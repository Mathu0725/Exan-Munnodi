import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {
      role: {
        in: ['Admin', 'Content Editor', 'Reviewer', 'Analyst'],
      },
    };

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        institution: true,
        phone: true,
        createdAt: true,
        approvedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: staff });
  } catch (error) {
    console.error('GET /api/admin/staff failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
