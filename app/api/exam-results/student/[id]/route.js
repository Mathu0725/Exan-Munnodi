import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = { userId: parseInt(id) };
    if (examId) where.examId = parseInt(examId);
    if (status) where.status = status;

    const results = await prisma.examResult.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('GET /api/exam-results/student/[id] failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
