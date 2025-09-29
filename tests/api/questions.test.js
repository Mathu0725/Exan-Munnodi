import { createMocks } from 'node-mocks-http';
import {
  GET as getQuestionsHandler,
  POST as createQuestionHandler,
} from '../../app/api/questions/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  question: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

describe('Questions API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/questions', () => {
    it('should return questions with pagination', async () => {
      const mockQuestions = [
        {
          id: 1,
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subject: { name: 'Mathematics' },
          category: { name: 'Basic Math' },
        },
        {
          id: 2,
          question: 'What is the capital of France?',
          difficulty: 'MEDIUM',
          subject: { name: 'Geography' },
          category: { name: 'World Geography' },
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);
      prisma.question.count.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.questions).toHaveLength(2);
      expect(data.data.pagination.total).toBe(2);
    });

    it('should filter questions by subject', async () => {
      const mockQuestions = [
        {
          id: 1,
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subject: { name: 'Mathematics' },
          category: { name: 'Basic Math' },
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);
      prisma.question.count.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          subjectId: '1',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.questions).toHaveLength(1);
    });

    it('should filter questions by difficulty', async () => {
      const mockQuestions = [
        {
          id: 1,
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subject: { name: 'Mathematics' },
          category: { name: 'Basic Math' },
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);
      prisma.question.count.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          difficulty: 'EASY',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.questions).toHaveLength(1);
    });

    it('should search questions by text', async () => {
      const mockQuestions = [
        {
          id: 1,
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subject: { name: 'Mathematics' },
          category: { name: 'Basic Math' },
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);
      prisma.question.count.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'addition',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.questions).toHaveLength(1);
    });

    it('should return error for invalid page number', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: 'invalid',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid page number');
    });

    it('should return error for invalid limit', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          limit: 'invalid',
        },
      });

      await getQuestionsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid limit');
    });
  });

  describe('POST /api/questions', () => {
    it('should create question successfully', async () => {
      const mockQuestion = {
        id: 1,
        question: 'What is 2 + 2?',
        difficulty: 'EASY',
        subjectId: 1,
        categoryId: 1,
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
        ],
      };

      prisma.question.create.mockResolvedValue(mockQuestion);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subjectId: 1,
          categoryId: 1,
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
          ],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.question).toBe('What is 2 + 2?');
    });

    it('should return error for missing question text', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          difficulty: 'EASY',
          subjectId: 1,
          categoryId: 1,
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
          ],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Question text is required');
    });

    it('should return error for missing subject', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          categoryId: 1,
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
          ],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Subject is required');
    });

    it('should return error for missing category', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subjectId: 1,
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
          ],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Category is required');
    });

    it('should return error for insufficient options', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subjectId: 1,
          categoryId: 1,
          options: [{ text: '3', isCorrect: false }],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('At least two options are required');
    });

    it('should return error for no correct answer', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          question: 'What is 2 + 2?',
          difficulty: 'EASY',
          subjectId: 1,
          categoryId: 1,
          options: [
            { text: '3', isCorrect: false },
            { text: '5', isCorrect: false },
          ],
        },
      });

      await createQuestionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('At least one correct answer is required');
    });
  });
});
