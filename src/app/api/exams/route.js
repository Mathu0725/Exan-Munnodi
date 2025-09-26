import { NextResponse } from 'next/server';
import { PrismaExamRepository } from '@/infrastructure/repositories/prismaExamRepository';
import { CreateExamUseCase } from '@/application/use-cases/exams/createExam';
import { ListExamsUseCase } from '@/application/use-cases/exams/listExams';

const examRepository = new PrismaExamRepository();
const createExam = new CreateExamUseCase(examRepository);
const listExams = new ListExamsUseCase(examRepository);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const query = searchParams.get('query') || undefined;
  const examTypeId = searchParams.get('examTypeId') ? Number(searchParams.get('examTypeId')) : undefined;

  try {
    const data = await listExams.execute({ status, query, examTypeId });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const exam = await createExam.execute(body);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
