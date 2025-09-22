import { auditLogService } from './auditLogService';

// Mock service for subjects
const getSubjectsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const subjects = localStorage.getItem('subjects');
  return subjects
    ? JSON.parse(subjects)
    : [
        { id: 1, name: 'General Knowledge', slug: 'general-knowledge', order: 1, active: true },
        { id: 2, name: 'Mathematics', slug: 'mathematics', order: 2, active: true },
      ];
};

const saveSubjectsToStorage = (subjects) => {
  localStorage.setItem('subjects', JSON.stringify(subjects));
};

const getSubSubjectsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const subSubjects = localStorage.getItem('subsubjects');
  return subSubjects
    ? JSON.parse(subSubjects)
    : [
        { id: 101, subject_id: 1, name: 'History', slug: 'history', order: 1 },
        { id: 102, subject_id: 1, name: 'Geography', slug: 'geography', order: 2 },
        { id: 201, subject_id: 2, name: 'Algebra', slug: 'algebra', order: 1 },
      ];
};

const saveSubSubjectsToStorage = (subSubjects) => {
  localStorage.setItem('subsubjects', JSON.stringify(subSubjects));
};

// Simulate API delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const subjectService = {
  async getSubjectsWithSubsubjects() {
    await delay(500);
    const subjects = getSubjectsFromStorage();
    const subsubjects = getSubSubjectsFromStorage();
    const data = subjects.map((subject) => ({
      ...subject,
      subsubjects: subsubjects
        .filter((ss) => ss.subject_id === subject.id)
        .sort((a, b) => a.order - b.order),
    }));
    return { data };
  },

  async getSubjects({ page = 1, limit = 10, search = '' }) {
    await delay(500);
    let subjects = getSubjectsFromStorage();
    if (search) {
      subjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    const total = subjects.length;
    const paginatedSubjects = subjects.slice((page - 1) * limit, page * limit);
    return { data: paginatedSubjects, total };
  },

  async createSubject(data) {
    await delay(500);
    const subjects = getSubjectsFromStorage();
    const newSubject = {
      id: Date.now(),
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    };
    const updatedSubjects = [...subjects, newSubject];
    saveSubjectsToStorage(updatedSubjects);
    auditLogService.logAction('CREATE', 'Subject', newSubject.id, `Created subject: ${newSubject.name}`);
    return newSubject;
  },

  async updateSubject(id, data) {
    await delay(500);
    let subjects = getSubjectsFromStorage();
    const oldSubject = subjects.find((s) => s.id === id);
    subjects = subjects.map((s) =>
      s.id === id ? { ...s, ...data, slug: data.name.toLowerCase().replace(/\s+/g, '-') } : s
    );
    saveSubjectsToStorage(subjects);
    const updatedSubject = subjects.find((s) => s.id === id);
    auditLogService.logAction('UPDATE', 'Subject', id, `Updated subject from "${oldSubject.name}" to "${updatedSubject.name}"`);
    return updatedSubject;
  },

  async deleteSubject(id) {
    await delay(500);
    let subjects = getSubjectsFromStorage();
    const subjectToDelete = subjects.find((s) => s.id === id);
    subjects = subjects.filter((s) => s.id !== id);
    saveSubjectsToStorage(subjects);
    if (subjectToDelete) {
      auditLogService.logAction('DELETE', 'Subject', id, `Deleted subject: ${subjectToDelete.name}`);
    }
    return { success: true };
  },

  async createSubSubject(data) {
    await delay(500);
    const subsubjects = getSubSubjectsFromStorage();
    const newSubSubject = {
      id: Date.now(),
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    };
    const updatedSubSubjects = [...subsubjects, newSubSubject];
    saveSubSubjectsToStorage(updatedSubSubjects);
    return newSubSubject;
  },

  async updateSubSubject(id, data) {
    await delay(500);
    let subsubjects = getSubSubjectsFromStorage();
    subsubjects = subsubjects.map((ss) =>
      ss.id === id ? { ...ss, ...data, slug: data.name.toLowerCase().replace(/\s+/g, '-') } : ss
    );
    saveSubSubjectsToStorage(subsubjects);
    return subsubjects.find((ss) => ss.id === id);
  },

  async deleteSubSubject(id) {
    await delay(500);
    let subsubjects = getSubSubjectsFromStorage();
    subsubjects = subsubjects.filter((ss) => ss.id !== id);
    saveSubSubjectsToStorage(subsubjects);
    return { success: true };
  },
};
