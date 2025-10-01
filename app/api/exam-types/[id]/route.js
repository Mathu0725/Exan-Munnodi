import { NextResponse } from 'next/server';
import { PrismaExamTypeRepository } from '@/infrastructure/repositories/prismaExamTypeRepository';
import { UpdateExamTypeUseCase } from '@/application/use-cases/examTypes/updateExamType';
import { DeleteExamTypeUseCase } from '@/application/use-cases/examTypes/deleteExamType';

const examTypeRepository = new PrismaExamTypeRepository();
const updateExamType = new UpdateExamTypeUseCase(examTypeRepository);
const deleteExamType = new DeleteExamTypeUseCase(examTypeRepository);

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const examType = await updateExamType.execute({
      id: params.id,
      ...body,
    });
    return NextResponse.json(examType);
  } catch (error) {
    console.error('PATCH /api/exam-types/[id] failed', error);
    const status = error.message === 'Exam type not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await deleteExamType.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/exam-types/[id] failed', error);
    const status = error.message === 'Exam type not found' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
