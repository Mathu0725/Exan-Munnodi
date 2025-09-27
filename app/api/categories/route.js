import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

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
    const name = (body?.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = (body?.slug || name.toLowerCase().replace(/\s+/g, '-')).trim();
    const last = await prisma.category.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
    const order = typeof body?.order === 'number' ? body.order : ((last?.order ?? 0) + 1);
    const active = body?.active !== undefined ? Boolean(body.active) : true;

    const created = await prisma.category.create({
      data: { name, slug, order, active },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // Prisma unique constraint error
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Category slug must be unique' }, { status: 409 });
    }
    console.error('Categories POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

