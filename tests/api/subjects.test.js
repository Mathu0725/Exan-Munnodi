import { createMocks } from 'node-mocks-http';
import {
  GET as getSubjectsHandler,
  POST as createSubjectHandler,
} from '../../app/api/subjects/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  subject: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

describe('Subjects API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/subjects', () => {
    it('should return subjects with pagination', async () => {
      const mockSubjects = [
        {
          id: 1,
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
        },
        {
          id: 2,
          name: 'Science',
          description: 'Scientific concepts and experiments',
        },
      ];

      prisma.subject.findMany.mockResolvedValue(mockSubjects);
      prisma.subject.count.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10',
        },
      });

      await getSubjectsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.subjects).toHaveLength(2);
      expect(data.data.pagination.total).toBe(2);
    });

    it('should search subjects by name', async () => {
      const mockSubjects = [
        {
          id: 1,
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
        },
      ];

      prisma.subject.findMany.mockResolvedValue(mockSubjects);
      prisma.subject.count.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'math',
        },
      });

      await getSubjectsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.subjects).toHaveLength(1);
    });

    it('should return error for invalid page number', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: 'invalid',
        },
      });

      await getSubjectsHandler(req, res);

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

      await getSubjectsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid limit');
    });
  });

  describe('POST /api/subjects', () => {
    it('should create subject successfully', async () => {
      const mockSubject = {
        id: 1,
        name: 'Mathematics',
        description: 'Mathematical concepts and problem solving',
      };

      prisma.subject.create.mockResolvedValue(mockSubject);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
        },
      });

      await createSubjectHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Mathematics');
    });

    it('should return error for missing subject name', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          description: 'Mathematical concepts and problem solving',
        },
      });

      await createSubjectHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Subject name is required');
    });

    it('should return error for empty subject name', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: '',
          description: 'Mathematical concepts and problem solving',
        },
      });

      await createSubjectHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Subject name cannot be empty');
    });

    it('should return error for duplicate subject name', async () => {
      prisma.subject.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: 'name' },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
        },
      });

      await createSubjectHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Subject with this name already exists');
    });
  });
});
