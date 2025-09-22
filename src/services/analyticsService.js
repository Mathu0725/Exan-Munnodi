// Mock service for Analytics Dashboard

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const analyticsService = {
  async getDashboardStats() {
    await delay(500);
    // In a real app, this data would come from the backend by querying different tables.
    const questions = JSON.parse(localStorage.getItem('questions') || '[]').length;
    const exams = JSON.parse(localStorage.getItem('exams') || '[]').length;
    const subjects = JSON.parse(localStorage.getItem('subjects') || '[]').length;
    const users = JSON.parse(localStorage.getItem('users') || '[]').length;

    return {
      data: {
        totalQuestions: questions,
        totalExams: exams,
        totalSubjects: subjects,
        totalUsers: users,
        recentActivity: [
          { id: 1, user: 'admin@example.com', action: 'Created exam "Weekly GK Test"' },
          { id: 2, user: 'editor@example.com', action: 'Added 5 new questions to "Mathematics"' },
        ],
      },
    };
  },
};
