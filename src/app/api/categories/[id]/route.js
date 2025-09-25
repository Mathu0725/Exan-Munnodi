import { NextResponse } from 'next/server';

// Mock categories data - this should be the same as in the main route
// In a real app, this would be a shared database or state management
let categories = [
  { id: 1, name: 'General Knowledge', slug: 'gk', active: true, order: 1 },
  { id: 2, name: 'Mathematics', slug: 'maths', active: true, order: 2 },
  { id: 3, name: 'English', slug: 'english', active: true, order: 3 },
  { id: 4, name: 'Science', slug: 'science', active: true, order: 4 },
  { id: 5, name: 'History', slug: 'history', active: true, order: 5 },
];

// Load categories from localStorage if available
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

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const category = categories.find(cat => cat.id === parseInt(id));
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
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

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('PUT request for category:', { id, body, currentCategories: categories });
    
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
      ...body,
      id: parseInt(id), // Ensure ID doesn't change
      slug: body.slug || body.name?.toLowerCase().replace(/\s+/g, '-') || categories[categoryIndex].slug,
    };

    categories[categoryIndex] = updatedCategory;
    console.log('Category updated:', updatedCategory);

    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('categories', JSON.stringify(categories));
      } catch (e) {
        console.warn('Failed to save categories to localStorage:', e);
      }
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Category PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log('DELETE request for category:', { id, currentCategories: categories });
    
    const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
    if (categoryIndex === -1) {
      console.log('Category not found:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const deletedCategory = categories[categoryIndex];
    categories.splice(categoryIndex, 1);
    console.log('Category deleted:', deletedCategory);

    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('categories', JSON.stringify(categories));
      } catch (e) {
        console.warn('Failed to save categories to localStorage:', e);
      }
    }

    return NextResponse.json({ success: true, deleted: deletedCategory });
  } catch (error) {
    console.error('Category DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
