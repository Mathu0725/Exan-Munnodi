import { NextResponse } from 'next/server';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prismaCategoryRepository';
import { ListCategoriesUseCase } from '@/application/use-cases/categories/listCategories';
import { CreateCategoryUseCase } from '@/application/use-cases/categories/createCategory';

const categoryRepository = new PrismaCategoryRepository();
const listCategories = new ListCategoriesUseCase(categoryRepository);
const createCategory = new CreateCategoryUseCase(categoryRepository);

export async function GET() {
  try {
    const categories = await listCategories.execute();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('GET /api/categories failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const category = await createCategory.execute({
      name: body.name,
      slug: body.slug,
      order: body.order,
      active: body.active,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories failed', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
import { NextResponse } from 'next/server';

// Mock categories data
let categories = [
  { id: 1, name: 'General Knowledge', slug: 'gk', active: true, order: 1 },
  { id: 2, name: 'Mathematics', slug: 'maths', active: true, order: 2 },
  { id: 3, name: 'English', slug: 'english', active: true, order: 3 },
  { id: 4, name: 'Science', slug: 'science', active: true, order: 4 },
  { id: 5, name: 'History', slug: 'history', active: true, order: 5 },
];

// Helper function to sync with localStorage
function syncWithLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          categories = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load categories from localStorage:', e);
    }
  }
}

// Helper function to save to localStorage
function saveToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage:', e);
    }
  }
}

export async function GET(request) {
  try {
    // Sync with localStorage first
    syncWithLocalStorage();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    let filteredCategories = categories;

    if (search) {
      filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredCategories.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredCategories.slice(startIndex, endIndex);
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
    const newCategory = {
      id: Date.now(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      active: body.active ?? true,
      order: body.order ?? categories.length + 1,
    };

    categories.push(newCategory);
    saveToLocalStorage();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Categories POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Handle PUT and DELETE for specific categories
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    console.log('PUT request received:', { id, updateData, currentCategories: categories });
    
    const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
    if (categoryIndex === -1) {
      console.log('Category not found:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updatedCategory = {
      ...categories[categoryIndex],
      ...updateData,
      slug: updateData.slug || updateData.name?.toLowerCase().replace(/\s+/g, '-') || categories[categoryIndex].slug,
    };

    categories[categoryIndex] = updatedCategory;
    console.log('Category updated:', updatedCategory);
    saveToLocalStorage();

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Categories PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    categories.splice(categoryIndex, 1);
    saveToLocalStorage();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
