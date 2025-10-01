import { auditLogService } from './auditLogService';

// Mock service for subjects
const getSubjectsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const subjects = localStorage.getItem('subjects');
  return subjects
    ? JSON.parse(subjects)
    : [
        {
          id: 1,
          name: 'General Knowledge',
          slug: 'general-knowledge',
          order: 1,
          active: true,
        },
        {
          id: 2,
          name: 'Mathematics',
          slug: 'mathematics',
          order: 2,
          active: true,
        },
      ];
};

const saveSubjectsToStorage = subjects => {
  localStorage.setItem('subjects', JSON.stringify(subjects));
};

const getSubSubjectsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const subSubjects = localStorage.getItem('subsubjects');
  return subSubjects
    ? JSON.parse(subSubjects)
    : [
        { id: 101, subject_id: 1, name: 'History', slug: 'history', order: 1 },
        {
          id: 102,
          subject_id: 1,
          name: 'Geography',
          slug: 'geography',
          order: 2,
        },
        { id: 201, subject_id: 2, name: 'Algebra', slug: 'algebra', order: 1 },
      ];
};

const saveSubSubjectsToStorage = subSubjects => {
  localStorage.setItem('subsubjects', JSON.stringify(subSubjects));
};

// Simulate API delay
const delay = ms => new Promise(res => setTimeout(res, ms));

export const subjectService = {
  async getSubjects({ page = 1, limit = 10, search = '' } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);

    const res = await fetch(`/api/subjects?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async getSubjectsWithSubsubjects() {
    const res = await fetch('/api/subjects', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async createSubject(data) {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    return res.json();
  },

  async updateSubject(id, data) {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update subject');
    return res.json();
  },

  async deleteSubject(id) {
    const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete subject');
    return res.json();
  },

  async getSubSubjectsForSubject(subjectId) {
    if (!subjectId) return { data: [] };
    const res = await fetch(`/api/subsubjects?subjectId=${subjectId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch sub-subjects');
    return res.json();
  },

  async createSubSubject(data) {
    const res = await fetch('/api/subsubjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create sub-subject');
    return res.json();
  },

  async updateSubSubject(id, data) {
    const res = await fetch(`/api/subsubjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update sub-subject');
    return res.json();
  },

  async deleteSubSubject(id) {
    const res = await fetch(`/api/subsubjects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete sub-subject');
    return res.json();
  },
};
