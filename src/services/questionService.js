// Mock service for Questions
const initialQuestions = [
  {
    id: 1,
    title: 'What is the capital of France?',
    subject_id: 1,
    category_id: 1,
    difficulty: 1,
    status: 'published',
    tags: ['geography', 'europe'],
  },
  {
    id: 2,
    title: 'Solve for x: 2x + 3 = 7',
    subject_id: 2,
    category_id: 2,
    difficulty: 2,
    status: 'published',
    tags: ['algebra', 'math'],
  },
  {
    id: 3,
    title: 'Who wrote "To Kill a Mockingbird"?',
    subject_id: 1,
    category_id: 1,
    difficulty: 3,
    status: 'draft',
    tags: ['literature'],
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

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const questionService = {
  async getQuestions({ page = 1, limit = 10, search = '', filters = {} }) {
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
    if (filters.category_id) {
      questions = questions.filter((q) => q.category_id === parseInt(filters.category_id));
    }
    if (filters.difficulty) {
      questions = questions.filter((q) => q.difficulty === parseInt(filters.difficulty));
    }

    const total = questions.length;
    const paginatedQuestions = questions.slice((page - 1) * limit, page * limit);
    return { data: paginatedQuestions, total, page, limit };
  },

  async createQuestion(data) {
    await delay(500);
    const questions = getQuestionsFromStorage();
    const newQuestion = {
      id: Date.now(),
      ...data,
      status: 'draft', // Default status
    };
    const updatedQuestions = [...questions, newQuestion];
    saveQuestionsToStorage(updatedQuestions);
    return newQuestion;
  },
};
