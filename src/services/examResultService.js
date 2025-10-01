// Mock service for Exam Results (localStorage)

const delay = ms => new Promise(res => setTimeout(res, ms));

const getResults = () => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('examResults');
  return raw ? JSON.parse(raw) : [];
};

const saveResults = items => {
  localStorage.setItem('examResults', JSON.stringify(items));
};

export const examResultService = {
  async submitResult({ examId, userEmail, answers, obtained, total }) {
    await delay(200);
    const items = getResults();
    const submission = {
      id: Date.now(),
      examId,
      userEmail,
      answers,
      obtained,
      total,
      submittedAt: new Date().toISOString(),
    };
    items.push(submission);
    saveResults(items);
    return submission;
  },

  async listByExam(examId) {
    await delay(200);
    const items = getResults();
    return items.filter(r => r.examId === parseInt(examId));
  },
};
