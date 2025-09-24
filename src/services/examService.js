// Mock service for Exams
import { auditLogService } from './auditLogService';

const initialExams = [
  {
    id: 1,
    title: 'Weekly General Knowledge Test',
    status: 'live',
    start_at: '2024-07-20T10:00:00Z',
    end_at: '2024-07-27T10:00:00Z',
    exam_type_id: 1,
  },
  {
    id: 2,
    title: 'Mathematics Practice - Algebra',
    status: 'scheduled',
    start_at: '2024-08-01T09:00:00Z',
    end_at: '2024-08-01T11:00:00Z',
    exam_type_id: 2,
  },
  {
    id: 3,
    title: 'Full Syllabus Mock Test 1',
    status: 'draft',
    start_at: null,
    end_at: null,
    exam_type_id: 1,
  },
  {
    id: 4,
    title: 'History Topic Test - Ancient Civilizations',
    status: 'archived',
    start_at: '2024-06-01T10:00:00Z',
    end_at: '2024-06-08T10:00:00Z',
    exam_type_id: 2,
  },
];

const getExamsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const exams = localStorage.getItem('exams');
  return exams ? JSON.parse(exams) : initialExams;
};

const saveExamsToStorage = (exams) => {
  localStorage.setItem('exams', JSON.stringify(exams));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const examService = {
  async getExams() {
    await delay(500);
    const exams = getExamsFromStorage();
    return { data: exams };
  },

  async getExam(id) {
    await delay(200);
    const exams = getExamsFromStorage();
    const exam = exams.find((e) => e.id === parseInt(id));
    if (!exam) {
      throw new Error('Exam not found');
    }
    return exam;
  },

  async createExam(data) {
    await delay(500);
    const exams = getExamsFromStorage();
    const newExam = {
      id: Date.now(),
      ...data,
      status: 'draft',
    };
    const updatedExams = [...exams, newExam];
    saveExamsToStorage(updatedExams);
    try { auditLogService.logAction('CREATE', 'Exam', newExam.id, `Created exam: ${newExam.title}`); } catch {}
    return newExam;
  },

  async updateExam(id, data) {
    await delay(300);
    let exams = getExamsFromStorage();
    const existing = exams.find((e) => e.id === id);
    if (!existing) throw new Error('Exam not found');
    exams = exams.map((e) => (e.id === id ? { ...e, ...data } : e));
    saveExamsToStorage(exams);
    try { auditLogService.logAction('UPDATE', 'Exam', id, `Updated exam: ${existing.title}`); } catch {}
    return exams.find((e) => e.id === id);
  },
};
