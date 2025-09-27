import { NextResponse } from 'next/server';
import { PrismaSubjectRepository } from '@/infrastructure/repositories/prismaSubjectRepository';
import { UpdateSubSubjectUseCase } from '@/application/use-cases/subjects/updateSubSubject';
import { DeleteSubSubjectUseCase } from '@/application/use-cases/subjects/deleteSubSubject';

const subjectRepository = new PrismaSubjectRepository();
const updateSubSubject = new UpdateSubSubjectUseCase(subjectRepository);
const deleteSubSubject = new DeleteSubSubjectUseCase(subjectRepository);

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const updated = await updateSubSubject.execute({
      id: params.id,
      subjectId: body.subjectId ?? body.subject_id,
      name: body.name,
      slug: body.slug,
      order: body.order,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/subsubjects/[id] failed', error);
    const status = error.message === 'Sub-subject not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await deleteSubSubject.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subsubjects/[id] failed', error);
    const status = error.message === 'Sub-subject not found' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

