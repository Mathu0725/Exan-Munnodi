// Mock services for Categories and Exam Types (localStorage-backed)
import { auditLogService } from './auditLogService';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Generic helpers
const getFromStorage = (key, fallback) => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed data
const initialCategories = [
  { id: 1, name: 'General Knowledge', slug: 'gk', active: true, order: 1 },
  { id: 2, name: 'Mathematics', slug: 'maths', active: true, order: 2 },
  { id: 3, name: 'English', slug: 'english', active: true, order: 3 },
];

const initialExamTypes = [
  { id: 1, name: 'Mock Test', slug: 'mock-test', active: true, order: 1 },
  { id: 2, name: 'Practice', slug: 'practice', active: true, order: 2 },
  { id: 3, name: 'Topic Test', slug: 'topic-test', active: true, order: 3 },
];

// Categories
export const categoryService = {
  async getAll() {
    const res = await fetch('/api/categories?limit=1000', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async list({ page = 1, limit = 10, search = '' } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    const res = await fetch(`/api/categories?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async create(payload) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async update(id, payload) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },
};

// Exam Types
export const examTypeService = {
  async getAll() {
    const res = await fetch('/api/exam-types', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exam types');
    return res.json();
  },

  async list({ page = 1, limit = 10, search = '', active } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    if (active !== undefined) params.set('active', String(active));
    const res = await fetch(`/api/exam-types?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exam types');
    return res.json();
  },

  async create(payload) {
    const res = await fetch('/api/exam-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create exam type');
    return res.json();
  },

  async update(id, payload) {
    const res = await fetch(`/api/exam-types/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update exam type');
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`/api/exam-types/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete exam type');
    return res.json();
  },
};
