import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e933e3c8e4e4a7b4a2e5d1f8a7c6b3e2a1d0c9f8b7e6a5d4c3b2a1f0e9d8c7b6');
    
    if (!['Admin', 'Content Editor', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { startAt, endAt, rescheduleReason } = await request.json();

    if (!startAt || !endAt) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(id) },
      data: {
        startAt: startDate,
        endAt: endDate,
        rescheduledAt: new Date(),
        rescheduleReason: rescheduleReason || null,
      },
    });

    // Send notifications to assigned groups about rescheduling
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
            title: 'Exam Rescheduled',
            message: `Exam "${updatedExam.title}" has been rescheduled to ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}. ${rescheduleReason ? `Reason: ${rescheduleReason}` : ''}`,
            type: 'warning',
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
    console.error('PATCH /api/exams/[id]/reschedule failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
