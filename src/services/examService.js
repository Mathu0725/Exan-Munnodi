export const examService = {
  async getExams(filter = {}) {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.query) params.set('query', filter.query);
    if (filter.examTypeId) params.set('examTypeId', String(filter.examTypeId));

    const res = await fetch(`/api/exams?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async getExam(id) {
    const res = await fetch(`/api/exams/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch exam');
    return res.json();
  },

  async createExam(payload) {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create exam');
    return res.json();
  },

  async updateExam(id, data) {
    const res = await fetch(`/api/exams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update exam');
    return res.json();
  },

  async deleteExam(id) {
    const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete exam');
    return res.json();
  },
};
