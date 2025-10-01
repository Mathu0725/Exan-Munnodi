import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);

    // Only Admin and Super Admin can manage student groups
    if (!['Admin', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Only Admin and Super Admin can manage student groups.',
        },
        { status: 403 }
      );
    }

    const groupId = parseInt(params.id);
    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs are required' },
        { status: 400 }
      );
    }

    // Verify the group exists
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

    // Verify all students exist and are active
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: 'Student',
        status: 'Active',
      },
      select: { id: true, name: true, email: true },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        {
          error: 'Some students not found or not active',
        },
        { status: 400 }
      );
    }

    // Get existing member IDs to avoid duplicates
    const existingMemberIds = group.members.map(member => member.userId);
    const newStudentIds = studentIds.filter(
      id => !existingMemberIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        {
          error: 'All selected students are already in this group',
        },
        { status: 400 }
      );
    }

    // Add students to the group
    await prisma.studentGroupMember.createMany({
      data: newStudentIds.map(userId => ({
        userId,
        groupId,
      })),
    });

    // Create notifications for the added students
    for (const studentId of newStudentIds) {
      await prisma.notification.create({
        data: {
          title: 'Added to Student Group',
          message: `You have been added to the student group "${group.name}".`,
          type: 'info',
          userId: studentId,
        },
      });
    }

    // Get updated group with members
    const updatedGroup = await prisma.studentGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            examGroups: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${newStudentIds.length} student(s) added to group successfully`,
        group: updatedGroup,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/student-groups/[id]/add-students failed', error);
    return NextResponse.json(
      { error: 'Failed to add students to group' },
      { status: 500 }
    );
  }
}
