import { createMocks } from 'node-mocks-http';
import {
  GET as getCategoriesHandler,
  POST as createCategoryHandler,
} from '../../app/api/categories/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

describe('Categories API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return categories with pagination', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Basic Math',
          description: 'Basic mathematical concepts',
        },
        {
          id: 2,
          name: 'Algebra',
          description: 'Algebraic concepts and equations',
        },
      ];

      prisma.category.findMany.mockResolvedValue(mockCategories);
      prisma.category.count.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10',
        },
      });

      await getCategoriesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.categories).toHaveLength(2);
      expect(data.data.pagination.total).toBe(2);
    });

    it('should search categories by name', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Basic Math',
          description: 'Basic mathematical concepts',
        },
      ];

      prisma.category.findMany.mockResolvedValue(mockCategories);
      prisma.category.count.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          search: 'math',
        },
      });

      await getCategoriesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.categories).toHaveLength(1);
    });

    it('should return error for invalid page number', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          page: 'invalid',
        },
      });

      await getCategoriesHandler(req, res);

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

      await getCategoriesHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid limit');
    });
  });

  describe('POST /api/categories', () => {
    it('should create category successfully', async () => {
      const mockCategory = {
        id: 1,
        name: 'Basic Math',
        description: 'Basic mathematical concepts',
      };

      prisma.category.create.mockResolvedValue(mockCategory);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Basic Math',
          description: 'Basic mathematical concepts',
        },
      });

      await createCategoryHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Basic Math');
    });

    it('should return error for missing category name', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          description: 'Basic mathematical concepts',
        },
      });

      await createCategoryHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Category name is required');
    });

    it('should return error for empty category name', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: '',
          description: 'Basic mathematical concepts',
        },
      });

      await createCategoryHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Category name cannot be empty');
    });

    it('should return error for duplicate category name', async () => {
      prisma.category.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: 'name' },
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Basic Math',
          description: 'Basic mathematical concepts',
        },
      });

      await createCategoryHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.message).toContain('Category with this name already exists');
    });
  });
});
