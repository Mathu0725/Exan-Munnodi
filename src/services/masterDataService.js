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
    // Convenience for forms (no pagination)
    const { data } = await this.list({ page: 1, limit: 1000, search: '' });
    return { data };
  },
  async list({ page = 1, limit = 10, search = '' } = {}) {
    await delay(300);
    let items = getFromStorage('categories', initialCategories);
    if (search) {
      items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }
    const total = items.length;
    const data = items.slice((page - 1) * limit, page * limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, meta: { currentPage: page, totalPages, total, pageSize: limit } };
  },

  async create(payload) {
    await delay(300);
    const items = getFromStorage('categories', initialCategories);
    const newItem = {
      id: Date.now(),
      ...payload,
      slug: (payload.slug || payload.name || '').toLowerCase().replace(/\s+/g, '-'),
      active: payload.active ?? true,
      order: payload.order ?? items.length + 1,
    };
    const updated = [...items, newItem];
    saveToStorage('categories', updated);
    try { auditLogService.logAction('CREATE', 'Category', newItem.id, `Created category: ${newItem.name}`); } catch {}
    return newItem;
  },

  async update(id, payload) {
    await delay(300);
    let items = getFromStorage('categories', initialCategories);
    items = items.map((i) =>
      i.id === id
        ? {
            ...i,
            ...payload,
            slug: (payload.slug || payload.name || i.name).toLowerCase().replace(/\s+/g, '-'),
          }
        : i
    );
    saveToStorage('categories', items);
    return items.find((i) => i.id === id);
  },

  async remove(id) {
    await delay(300);
    const items = getFromStorage('categories', initialCategories);
    const updated = items.filter((i) => i.id !== id);
    saveToStorage('categories', updated);
    try { auditLogService.logAction('DELETE', 'Category', id, `Deleted category #${id}`); } catch {}
    return { success: true };
  },
};

// Exam Types
export const examTypeService = {
  async getAll() {
    const { data } = await this.list({ page: 1, limit: 1000, search: '' });
    return { data };
  },
  async list({ page = 1, limit = 10, search = '' } = {}) {
    await delay(300);
    let items = getFromStorage('examTypes', initialExamTypes);
    if (search) {
      items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }
    const total = items.length;
    const data = items.slice((page - 1) * limit, page * limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, meta: { currentPage: page, totalPages, total, pageSize: limit } };
  },

  async create(payload) {
    await delay(300);
    const items = getFromStorage('examTypes', initialExamTypes);
    const newItem = {
      id: Date.now(),
      ...payload,
      slug: (payload.slug || payload.name || '').toLowerCase().replace(/\s+/g, '-'),
      active: payload.active ?? true,
      order: payload.order ?? items.length + 1,
    };
    const updated = [...items, newItem];
    saveToStorage('examTypes', updated);
    try { auditLogService.logAction('CREATE', 'ExamType', newItem.id, `Created exam type: ${newItem.name}`); } catch {}
    return newItem;
  },

  async update(id, payload) {
    await delay(300);
    let items = getFromStorage('examTypes', initialExamTypes);
    items = items.map((i) =>
      i.id === id
        ? {
            ...i,
            ...payload,
            slug: (payload.slug || payload.name || i.name).toLowerCase().replace(/\s+/g, '-'),
          }
        : i
    );
    saveToStorage('examTypes', items);
    return items.find((i) => i.id === id);
  },

  async remove(id) {
    await delay(300);
    const items = getFromStorage('examTypes', initialExamTypes);
    const updated = items.filter((i) => i.id !== id);
    saveToStorage('examTypes', updated);
    try { auditLogService.logAction('DELETE', 'ExamType', id, `Deleted exam type #${id}`); } catch {}
    return { success: true };
  },
};
