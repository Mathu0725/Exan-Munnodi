import { NextResponse } from 'next/server';
import { PrismaExamRepository } from '@/infrastructure/repositories/prismaExamRepository';
import { UpdateExamUseCase } from '@/application/use-cases/exams/updateExam';

const examRepository = new PrismaExamRepository();
const updateExam = new UpdateExamUseCase(examRepository);

export async function GET(_request, { params }) {
  try {
    const exam = await examRepository.findById(params.id);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const exam = await updateExam.execute({ id: params.id, ...body });
    return NextResponse.json(exam);
  } catch (error) {
    const status = error.message === 'Exam not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await examRepository.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
