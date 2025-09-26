import { NextResponse } from 'next/server';
import { PrismaSubjectRepository } from '@/infrastructure/repositories/prismaSubjectRepository';
import { UpdateSubjectUseCase } from '@/application/use-cases/subjects/updateSubject';
import { DeleteSubjectUseCase } from '@/application/use-cases/subjects/deleteSubject';

const subjectRepository = new PrismaSubjectRepository();
const updateSubject = new UpdateSubjectUseCase(subjectRepository);
const deleteSubject = new DeleteSubjectUseCase(subjectRepository);

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const subject = await updateSubject.execute({
      id: params.id,
      name: body.name,
      slug: body.slug,
      order: body.order,
      active: body.active,
    });
    return NextResponse.json(subject);
  } catch (error) {
    console.error('PATCH /api/subjects/[id] failed', error);
    const status = error.message === 'Subject not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await deleteSubject.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subjects/[id] failed', error);
    const status = error.message === 'Subject not found' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

