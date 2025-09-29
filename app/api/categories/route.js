import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { categorySchemas } from '@/lib/validations/schemas';
import {
  validateQuery,
  validateBody,
  createValidationErrorResponse,
  sanitizeInput,
} from '@/lib/validations/middleware';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = validateQuery(categorySchemas.list, searchParams);
    if (!queryValidation.success) {
      return createValidationErrorResponse(queryValidation.error);
    }

    const { page, limit, search } = sanitizeInput(queryValidation.data);

    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined;

    const total = await prisma.category.count({ where });
    const data = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      data,
      meta: {
        currentPage: page,
        totalPages,
        total,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = validateBody(categorySchemas.create, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData = sanitizeInput(validation.data);
    const { name, description, order } = validatedData;

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const last = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const finalOrder = order !== undefined ? order : (last?.order ?? 0) + 1;

    const created = await prisma.category.create({
      data: {
        name,
        slug,
        order: finalOrder,
        active: true,
        description: description || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // Prisma unique constraint error
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category slug must be unique' },
        { status: 409 }
      );
    }
    console.error('Categories POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
