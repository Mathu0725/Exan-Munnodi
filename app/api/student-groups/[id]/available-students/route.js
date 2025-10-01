import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);

    // Only Admin and Super Admin can view student groups
    if (!['Admin', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Only Admin and Super Admin can view student groups.',
        },
        { status: 403 }
      );
    }

    const groupId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');

    // Get current group members
    const group = await prisma.studentGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: { userId: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const existingMemberIds = group.members.map(member => member.userId);

    // Build search conditions
    const where = {
      role: 'Student',
      status: 'Active',
      id: { notIn: existingMemberIds }, // Exclude students already in the group
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          institution: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      data: students,
      meta: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(
      'GET /api/student-groups/[id]/available-students failed',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch available students' },
      { status: 500 }
    );
  }
}
