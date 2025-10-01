import { NextResponse } from 'next/server';
import { PrismaSubjectRepository } from '@/infrastructure/repositories/prismaSubjectRepository';
import { ListSubSubjectsUseCase } from '@/application/use-cases/subjects/listSubSubjects';
import { CreateSubSubjectUseCase } from '@/application/use-cases/subjects/createSubSubject';

const subjectRepository = new PrismaSubjectRepository();
const listSubSubjects = new ListSubSubjectsUseCase(subjectRepository);
const createSubSubject = new CreateSubSubjectUseCase(subjectRepository);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const subsubjects = await listSubSubjects.execute(subjectId);
    return NextResponse.json({ data: subsubjects });
  } catch (error) {
    console.error('GET /api/subsubjects failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const subsubject = await createSubSubject.execute({
      subjectId: body.subjectId ?? body.subject_id,
      name: body.name,
      slug: body.slug,
      order: body.order,
    });
    return NextResponse.json(subsubject, { status: 201 });
  } catch (error) {
    console.error('POST /api/subsubjects failed', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
