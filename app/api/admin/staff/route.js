import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function GET(request) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request, {
      requiredRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

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
