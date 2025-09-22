// Mock service for Exams

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
    return newExam;
  },
};
