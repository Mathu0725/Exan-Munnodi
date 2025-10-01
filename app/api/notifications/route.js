import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const limit = Number(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const where = { userId: Number(userId) };
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET /api/notifications failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { notificationIds, isRead } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Notification IDs array is required' },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { isRead },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/notifications failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
