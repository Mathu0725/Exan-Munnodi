import axios from 'axios';

export const dashboardService = {
  async getSummary() {
    const [examsRes, questionsRes, usersRes] = await Promise.allSettled([
      axios.get('/api/exams').catch(() => ({ data: { data: [] } })),
      axios.get('/api/questions').catch(() => ({ data: { data: [] } })),
      axios.get('/api/users').catch(() => ({ data: { data: [] } })),
    ]);

    const exams =
      examsRes.status === 'fulfilled' ? examsRes.value.data?.data || [] : [];
    const questions =
      questionsRes.status === 'fulfilled'
        ? questionsRes.value.data?.data || []
        : [];
    const users =
      usersRes.status === 'fulfilled' ? usersRes.value.data?.data || [] : [];

    const upcoming = exams.filter(exam => exam.status === 'scheduled').length;
    const live = exams.filter(exam => exam.status === 'live').length;
    const completed = exams.filter(exam => exam.status === 'archived').length;

    return {
      totalExams: exams.length,
      totalQuestions: questions.length,
      totalUsers: users.length,
      upcoming,
      live,
      completed,
    };
  },
};
