import { NextResponse } from 'next/server';
import { PrismaExamTypeRepository } from '@/infrastructure/repositories/prismaExamTypeRepository';
import { ListExamTypesUseCase } from '@/application/use-cases/examTypes/listExamTypes';
import { CreateExamTypeUseCase } from '@/application/use-cases/examTypes/createExamType';

const examTypeRepository = new PrismaExamTypeRepository();
const listExamTypes = new ListExamTypesUseCase(examTypeRepository);
const createExamType = new CreateExamTypeUseCase(examTypeRepository);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      search: searchParams.get('search') ?? undefined,
      active: searchParams.get('active') === null ? undefined : searchParams.get('active') === 'true',
    };
    const examTypes = await listExamTypes.execute(filter);
    return NextResponse.json({ data: examTypes });
  } catch (error) {
    console.error('GET /api/exam-types failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const examType = await createExamType.execute(body);
    return NextResponse.json(examType, { status: 201 });
  } catch (error) {
    console.error('POST /api/exam-types failed', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

