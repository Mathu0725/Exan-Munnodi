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
    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions must be an array' }, { status: 400 });
    }

    // Validate that all question IDs exist
    const questionIds = questions.map(q => q.id);
    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });

    if (existingQuestions.length !== questionIds.length) {
      return NextResponse.json({ error: 'Some questions do not exist' }, { status: 400 });
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
