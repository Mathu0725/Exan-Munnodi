import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const category = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Category GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const data = {
      name: body?.name !== undefined ? String(body.name).trim() : undefined,
      slug: body?.slug !== undefined
        ? String(body.slug).trim()
        : (body?.name ? String(body.name).toLowerCase().replace(/\s+/g, '-') : undefined),
      order: typeof body?.order === 'number' ? body.order : undefined,
      active: body?.active !== undefined ? Boolean(body.active) : undefined,
    };

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Category slug must be unique' }, { status: 409 });
    }
    console.error('Category PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const deleted = await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    console.error('Category DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
