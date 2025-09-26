import { NextResponse } from 'next/server';
import { PrismaSubjectRepository } from '@/infrastructure/repositories/prismaSubjectRepository';
import { ListSubjectsUseCase } from '@/application/use-cases/subjects/listSubjects';
import { CreateSubjectUseCase } from '@/application/use-cases/subjects/createSubject';

const subjectRepository = new PrismaSubjectRepository();
const listSubjects = new ListSubjectsUseCase(subjectRepository);
const createSubject = new CreateSubjectUseCase(subjectRepository);

export async function GET() {
  try {
    const subjects = await listSubjects.execute();
    return NextResponse.json({ data: subjects });
  } catch (error) {
    console.error('GET /api/subjects failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const subject = await createSubject.execute({
      name: body.name,
      slug: body.slug,
      order: body.order,
      active: body.active,
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('POST /api/subjects failed', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
