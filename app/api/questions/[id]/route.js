import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/infrastructure/repositories/prismaQuestionRepository';
import { DeleteQuestionUseCase } from '@/application/use-cases/questions/deleteQuestion';
import { UpdateQuestionUseCase } from '@/application/use-cases/questions/updateQuestion';

const questionRepository = new PrismaQuestionRepository();
const deleteQuestion = new DeleteQuestionUseCase(questionRepository);
const updateQuestion = new UpdateQuestionUseCase(questionRepository);

export async function GET(_request, { params }) {
  try {
    const question = await questionRepository.findById(params.id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const existing = await questionRepository.findById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const updated = await updateQuestion.execute({
      id: params.id,
      title: body.title,
      body: body.body,
      subjectId: body.subject_id,
      subSubjectId: body.sub_subject_id,
      categoryId: body.category_id,
      difficulty: body.difficulty,
      marks: body.marks,
      negativeMarks: body.negative_marks,
      status: body.status,
      tags: body.tags,
      options: body.options,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await deleteQuestion.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message === 'Question not found' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
