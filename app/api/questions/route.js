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

const questionRepository = new PrismaQuestionRepository();
const listQuestions = new GetQuestionListUseCase(questionRepository);
const createQuestion = new CreateQuestionUseCase(questionRepository);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: List questions
 *     description: Retrieve a paginated list of questions with optional filtering
 *     tags: [Questions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of questions per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for question content
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *         description: Filter by subject ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Question'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withErrorHandler(async request => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryValidation = validateQuery(questionSchemas.list, searchParams);
  if (!queryValidation.success) {
    return createValidationErrorResponse(queryValidation.error);
  }

  const filter = sanitizeInput(queryValidation.data);

  const result = await listQuestions.execute(filter);

  return createSuccessResponse({
    data: result.data,
    meta: {
      currentPage: result.page,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      total: result.total,
      pageSize: result.limit,
    },
  });
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

  return createSuccessResponse(
    {
      question,
      duplicatesRemoved: duplicates.length,
      message:
        duplicates.length > 0
          ? `${duplicates.length} duplicate(s) were automatically removed.`
          : 'Question created successfully.',
    },
    'Question created successfully',
    201
  );
});
