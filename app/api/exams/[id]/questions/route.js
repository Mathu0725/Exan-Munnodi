import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function PATCH(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyAccessToken(token);

    if (!['Admin', 'Content Editor', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Questions must be an array' },
        { status: 400 }
      );
    }

    // Validate that all question IDs exist
    const questionIds = questions.map(q => q.id);
    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });

    if (existingQuestions.length !== questionIds.length) {
      return NextResponse.json(
        { error: 'Some questions do not exist' },
        { status: 400 }
      );
    }

    const updatedExam = await prisma.exam.update({
      where: { id: parseInt(id) },
      data: {
        questions: JSON.stringify(questions),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('PATCH /api/exams/[id]/questions failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
