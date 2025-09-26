// Service for Questions: tries API first, falls back to localStorage mocks
import { auditLogService } from './auditLogService';
import axios from 'axios';
const initialQuestions = [
  {
    id: 1,
    title: 'What is the capital of France?',
    body: 'Select the correct capital city of France.',
    subject_id: 1,
    sub_subject_id: null,
    category_id: 1,
    difficulty: 1,
    marks: 1,
    negative_marks: 0,
    time_limit: null,
    status: 'published',
    tags: ['geography', 'europe'],
    options: [
      { id: 'a', text: 'Paris', is_correct: true },
      { id: 'b', text: 'Lyon', is_correct: false },
      { id: 'c', text: 'Marseille', is_correct: false },
      { id: 'd', text: 'Nice', is_correct: false },
    ],
  },
  {
    id: 2,
    title: 'Solve for x: 2x + 3 = 7',
    body: 'Find the value of x that satisfies the equation.',
    subject_id: 2,
    sub_subject_id: 201,
    category_id: 2,
    difficulty: 2,
    marks: 2,
    negative_marks: 0,
    time_limit: 60,
    status: 'published',
    tags: ['algebra', 'math'],
    options: [
      { id: 'a', text: '1', is_correct: false },
      { id: 'b', text: '2', is_correct: true },
      { id: 'c', text: '3', is_correct: false },
      { id: 'd', text: '4', is_correct: false },
    ],
  },
  {
    id: 3,
    title: 'Who wrote "To Kill a Mockingbird"?',
    body: 'Choose the correct author for the classic novel.',
    subject_id: 1,
    sub_subject_id: null,
    category_id: 1,
    difficulty: 3,
    marks: 1,
    negative_marks: 0,
    time_limit: null,
    status: 'draft',
    tags: ['literature'],
    options: [
      { id: 'a', text: 'Harper Lee', is_correct: true },
      { id: 'b', text: 'Mark Twain', is_correct: false },
      { id: 'c', text: 'Ernest Hemingway', is_correct: false },
      { id: 'd', text: 'F. Scott Fitzgerald', is_correct: false },
    ],
  },
];

const getQuestionsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const questions = localStorage.getItem('questions');
  return questions ? JSON.parse(questions) : initialQuestions;
};

const saveQuestionsToStorage = (questions) => {
  localStorage.setItem('questions', JSON.stringify(questions));
};

const getVersionsFromStorage = () => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem('questionVersions');
  return raw ? JSON.parse(raw) : {};
};

const saveVersionsToStorage = (versions) => {
  localStorage.setItem('questionVersions', JSON.stringify(versions));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const questionService = {
  async getQuestions({ page = 1, limit = 10, search = '', filters = {} }) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });

    const res = await fetch(`/api/questions?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async getQuestion(id) {
    const res = await fetch(`/api/questions/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch question');
    return res.json();
  },

  async createQuestion(payload) {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create question');
    return res.json();
  },

  async updateQuestion(id, data) {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update question');
    return res.json();
  },

  async deleteQuestion(id) {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete question');
    return res.json();
  },
};
