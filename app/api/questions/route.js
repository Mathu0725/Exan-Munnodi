import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/infrastructure/repositories/prismaQuestionRepository';
import { GetQuestionListUseCase } from '@/application/use-cases/questions/getQuestionList';
import { CreateQuestionUseCase } from '@/application/use-cases/questions/createQuestion';

const questionRepository = new PrismaQuestionRepository();
const listQuestions = new GetQuestionListUseCase(questionRepository);
const createQuestion = new CreateQuestionUseCase(questionRepository);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      page: Number(searchParams.get('page') || '1'),
      limit: Number(searchParams.get('limit') || '10'),
      query: searchParams.get('search') || undefined,
      subjectId: searchParams.get('subject_id') || undefined,
      subSubjectId: searchParams.get('sub_subject_id') || undefined,
      categoryId: searchParams.get('category_id') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
    };

    const result = await listQuestions.execute(filter);

    return NextResponse.json({
      data: result.data,
      meta: {
        currentPage: result.page,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
        total: result.total,
        pageSize: result.limit,
      },
    });
  } catch (error) {
    console.error('GET /api/questions failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check for duplicates before creating
    const duplicates = await questionRepository.findDuplicates(
      body.title,
      body.subject_id,
      body.category_id
    );

    const question = await createQuestion.execute({
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

    return NextResponse.json({
      question,
      duplicatesRemoved: duplicates.length,
      message: duplicates.length > 0 
        ? `${duplicates.length} duplicate(s) were automatically removed.` 
        : 'Question created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/questions failed', error);
    console.error('Request body:', body);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack,
      body: body 
    }, { status: 400 });
  }
}


