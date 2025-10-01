import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function PATCH(request, { params }) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request, {
      requiredRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_EDITOR]
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    const { id } = params;
    const { startAt, endAt, isScheduled } = await request.json();

    if (!startAt || !endAt) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    if (startDate <= new Date()) {
      return NextResponse.json({ error: 'Start time must be in the future' }, { status: 400 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(id) },
      data: {
        startAt: startDate,
        endAt: endDate,
        isScheduled: true,
        scheduledAt: new Date(),
        status: 'scheduled',
      },
    });

    // Send notifications to assigned groups
    const examGroups = await prisma.examGroup.findMany({
      where: { examId: parseInt(id) },
      include: {
        group: {
          include: {
            members: true,
          },
        },
      },
    });

    if (examGroups.length > 0) {
      const notifications = [];
      for (const examGroup of examGroups) {
        for (const member of examGroup.group.members) {
          notifications.push({
            title: 'Exam Scheduled',
            message: `Exam "${updatedExam.title}" has been scheduled for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`,
            type: 'info',
            userId: member.userId,
            groupId: examGroup.groupId,
            examId: parseInt(id),
          });
        }
      }

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('PATCH /api/exams/[id]/schedule failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
