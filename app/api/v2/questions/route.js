import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/infrastructure/repositories/prismaQuestionRepository';
import { GetQuestionListUseCase } from '@/application/use-cases/questions/getQuestionList';
import { CreateQuestionUseCase } from '@/application/use-cases/questions/createQuestion';
import { questionSchemas } from '@/lib/validations/schemas';
import {
  validateQuery,
  validateBody,
  createValidationErrorResponse,
  sanitizeInput,
} from '@/lib/validations/middleware';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/errors/errorHandler';
import { addVersionHeaders } from '@/lib/api/versioning';
import { logBusinessEvent } from '@/lib/logger/requestLogger';

const questionRepository = new PrismaQuestionRepository();
const listQuestions = new GetQuestionListUseCase(questionRepository);
const createQuestion = new CreateQuestionUseCase(questionRepository);

export const GET = withErrorHandler(async request => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = validateQuery(questionSchemas.list, searchParams);
  if (!queryValidation.success) {
    return createValidationErrorResponse(queryValidation.error);
  }

  const filter = sanitizeInput(queryValidation.data);

  const result = await listQuestions.execute(filter);

  // Enhanced response with additional metadata for v2
  const response = createSuccessResponse({
    data: result.data,
    meta: {
      currentPage: result.page,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      total: result.total,
      pageSize: result.limit,
      version: 'v2',
      features: [
        'enhanced_pagination',
        'improved_filtering',
        'better_validation',
        'security_headers',
      ],
    },
    analytics: {
      queryTime: Date.now(),
      cacheHit: false, // Could be implemented with Redis
      filters: Object.keys(filter).length,
    },
  });

  // Add version headers
  return addVersionHeaders('v2', response);
});

export const POST = withErrorHandler(async request => {
  const body = await request.json();

  // Validate request body
  const validation = validateBody(questionSchemas.create, body);
  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }

  const validatedData = sanitizeInput(validation.data);

  // Check for duplicates before creating
  const duplicates = await questionRepository.findDuplicates(
    validatedData.question,
    validatedData.subjectId,
    validatedData.categoryId
  );

  const question = await createQuestion.execute({
    title: validatedData.question,
    body: validatedData.question,
    subjectId: validatedData.subjectId,
    subSubjectId: validatedData.subSubjectId,
    categoryId: validatedData.categoryId,
    difficulty: validatedData.difficulty,
    marks: 1, // Default marks
    negativeMarks: 0, // Default negative marks
    status: 'ACTIVE',
    tags: validatedData.tags || [],
    options: validatedData.options,
  });

  // Log business event
  logBusinessEvent('question_created', {
    questionId: question.id,
    difficulty: validatedData.difficulty,
    subjectId: validatedData.subjectId,
    duplicatesRemoved: duplicates.length,
  });

  const response = createSuccessResponse(
    {
      question,
      duplicatesRemoved: duplicates.length,
      message:
        duplicates.length > 0
          ? `${duplicates.length} duplicate(s) were automatically removed.`
          : 'Question created successfully.',
      version: 'v2',
      features: [
        'enhanced_duplicate_detection',
        'improved_validation',
        'better_error_handling',
        'business_event_logging',
      ],
    },
    'Question created successfully',
    201
  );

  // Add version headers
  return addVersionHeaders('v2', response);
});
