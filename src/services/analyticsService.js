// Analytics service for Dashboard - now uses real API data

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const analyticsService = {
  async getDashboardStats() {
    try {
      // Fetch real data from API endpoints
      const [questionsRes, examsRes, subjectsRes, usersRes] = await Promise.allSettled([
        fetch('/api/questions?limit=1000').then(res => res.json()),
        fetch('/api/exams?limit=1000').then(res => res.json()),
        fetch('/api/subjects?limit=1000').then(res => res.json()),
        fetch('/api/admin/users?limit=1000').then(res => res.json()).catch(() => ({ data: [], meta: { total: 0 } }))
      ]);

      const questions = questionsRes.status === 'fulfilled' ? questionsRes.value?.meta?.total || 0 : 0;
      const exams = examsRes.status === 'fulfilled' ? examsRes.value?.meta?.total || 0 : 0;
      const subjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value?.meta?.total || 0 : 0;
      const users = usersRes.status === 'fulfilled' ? usersRes.value?.meta?.total || 0 : 0;

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
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Fallback to zero values if API calls fail
      return {
        data: {
          totalQuestions: 0,
          totalExams: 0,
          totalSubjects: 0,
          totalUsers: 0,
          recentActivity: [],
        },
      };
    }
  },
};
