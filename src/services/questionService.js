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
    // Try API
    try {
      const res = await axios.get('/api/questions', { params: { page, limit, search, ...filters } });
      return res.data;
    } catch {}

    // Fallback to mock
    await delay(500);
    let questions = getQuestionsFromStorage();

    if (search) {
      questions = questions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.subject_id) {
      questions = questions.filter((q) => q.subject_id === parseInt(filters.subject_id));
    }
    if (filters.sub_subject_id) {
      questions = questions.filter((q) => (q.sub_subject_id ?? null) === parseInt(filters.sub_subject_id));
    }
    if (filters.category_id) {
      questions = questions.filter((q) => q.category_id === parseInt(filters.category_id));
    }
    if (filters.difficulty) {
      questions = questions.filter((q) => q.difficulty === parseInt(filters.difficulty));
    }

    const total = questions.length;
    const paginatedQuestions = questions.slice((page - 1) * limit, page * limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: paginatedQuestions,
      meta: {
        currentPage: page,
        totalPages,
        total,
        pageSize: limit,
      },
    };
  },

  async createQuestion(data) {
    try {
      const res = await axios.post('/api/questions', data);
      return res.data;
    } catch {}

    await delay(500);
    const questions = getQuestionsFromStorage();
    const newQuestion = {
      id: Date.now(),
      ...data,
      status: data.status || 'draft',
    };
    const updatedQuestions = [...questions, newQuestion];
    saveQuestionsToStorage(updatedQuestions);
    try {
      auditLogService.logAction('CREATE', 'Question', newQuestion.id, `Created question: ${newQuestion.title}`);
    } catch {}
    return newQuestion;
  },

  async deleteManyQuestions({ ids }) {
    await delay(300);
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: true };
    }
    const questions = getQuestionsFromStorage();
    const idSet = new Set(ids);
    const remaining = questions.filter((q) => !idSet.has(q.id));
    saveQuestionsToStorage(remaining);
    return { success: true, deletedCount: questions.length - remaining.length };
  },

  async createManyQuestions({ questions }) {
    await delay(500);
    const existing = getQuestionsFromStorage();
    const normalized = (questions || []).map((q) => ({
      id: Date.now() + Math.floor(Math.random() * 100000),
      title: q.title,
      body: q.body || '',
      subject_id: q.subject_id,
      sub_subject_id: q.sub_subject_id ?? null,
      category_id: q.category_id,
      difficulty: q.difficulty ?? 1,
      marks: q.marks ?? 1,
      negative_marks: q.negative_marks ?? 0,
      time_limit: q.time_limit ?? null,
      status: q.status || 'draft',
      tags: Array.isArray(q.tags) ? q.tags : [],
      options: Array.isArray(q.options) ? q.options : [],
    }));
    const updated = [...normalized, ...existing];
    saveQuestionsToStorage(updated);
    try {
      normalized.forEach((q) => auditLogService.logAction('CREATE', 'Question', q.id, `Imported question: ${q.title}`));
    } catch {}
    return { success: true, created: normalized.length };
  },

  async updateQuestion(id, data) {
    await delay(400);
    let questions = getQuestionsFromStorage();
    const existing = questions.find((q) => q.id === id);
    if (!existing) throw new Error('Question not found');

    // store previous version
    const versions = getVersionsFromStorage();
    const prevList = Array.isArray(versions[id]) ? versions[id] : [];
    const versionEntry = {
      versionId: Date.now(),
      timestamp: new Date().toISOString(),
      snapshot: existing,
    };
    const updatedVersions = { ...versions, [id]: [versionEntry, ...prevList] };
    saveVersionsToStorage(updatedVersions);

    // apply update
    questions = questions.map((q) => (q.id === id ? { ...q, ...data } : q));
    saveQuestionsToStorage(questions);
    try {
      auditLogService.logAction('UPDATE', 'Question', id, `Updated question: ${existing.title} -> ${(data.title || existing.title)}`);
    } catch {}
    return questions.find((q) => q.id === id);
  },

  async getQuestionVersions(id) {
    await delay(200);
    const versions = getVersionsFromStorage();
    return { data: Array.isArray(versions[id]) ? versions[id] : [] };
  },

  async deleteManyQuestions({ ids }) {
    await delay(300);
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: true };
    }
    const questions = getQuestionsFromStorage();
    const idSet = new Set(ids);
    const toDelete = questions.filter((q) => idSet.has(q.id));
    const remaining = questions.filter((q) => !idSet.has(q.id));
    saveQuestionsToStorage(remaining);
    try {
      toDelete.forEach((q) => auditLogService.logAction('DELETE', 'Question', q.id, `Deleted question: ${q.title}`));
    } catch {}
    return { success: true, deletedCount: toDelete.length };
  },
};
