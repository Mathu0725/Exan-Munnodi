'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaEye } from 'react-icons/fa';

const EditableExamQuestions = ({ exam, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const queryClient = useQueryClient();

  // Get current exam questions
  const { data: examQuestions } = useQuery({
    queryKey: ['exam-questions', exam.id],
    queryFn: async () => {
      if (!exam.questions) return [];
      try {
        return JSON.parse(exam.questions);
      } catch {
        return [];
      }
    },
  });

  // Get all available questions
  const { data: allQuestions } = useQuery({
    queryKey: ['all-questions-for-exam'],
    queryFn: async () => {
      const res = await fetch('/api/questions?limit=1000');
      if (!res.ok) throw new Error('Failed to load questions');
      return res.json();
    },
  });

  // Get categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      return res.json();
    },
  });

  useEffect(() => {
    if (examQuestions) {
      setQuestions(examQuestions);
    }
  }, [examQuestions]);

  const updateExamQuestionsMutation = useMutation({
    mutationFn: async (newQuestions) => {
      const res = await fetch(`/api/exams/${exam.id}/questions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: newQuestions }),
      });
      if (!res.ok) throw new Error('Failed to update exam questions');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-questions', exam.id]);
      queryClient.invalidateQueries(['exams']);
      setIsEditing(false);
    },
  });

  const handleAddQuestion = (question) => {
    if (!questions.find(q => q.id === question.id)) {
      setQuestions(prev => [...prev, question]);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleSave = () => {
    updateExamQuestionsMutation.mutate(questions);
  };

  const handleCancel = () => {
    setQuestions(examQuestions || []);
    setIsEditing(false);
  };

  // Filter available questions
  const filteredQuestions = allQuestions?.data?.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || question.categoryId === parseInt(filterCategory);
    const notAlreadyAdded = !questions.find(q => q.id === question.id);
    return matchesSearch && matchesCategory && notAlreadyAdded;
  }) || [];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Exam Questions</h3>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Questions
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateExamQuestionsMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                <FaSave className="mr-2" />
                {updateExamQuestionsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Exam Questions */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Current Questions ({questions.length})
          </h4>
          
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions added to this exam yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          question.difficulty === 1 ? 'bg-green-100 text-green-800' :
                          question.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty === 1 ? 'Easy' : question.difficulty === 2 ? 'Medium' : 'Hard'}
                        </span>
                        <span className="text-xs text-gray-500">{question.marks} marks</span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">{question.title}</h5>
                      <p className="text-sm text-gray-600 line-clamp-2">{question.body}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Questions to Add */}
        {isEditing && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Add Questions</h4>
            
            {/* Search and Filter */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories?.data?.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No available questions.</p>
                </div>
              ) : (
                filteredQuestions.map(question => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            question.difficulty === 1 ? 'bg-green-100 text-green-800' :
                            question.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty === 1 ? 'Easy' : question.difficulty === 2 ? 'Medium' : 'Hard'}
                          </span>
                          <span className="text-xs text-gray-500">{question.marks} marks</span>
                          <span className="text-xs text-gray-500">{question.status}</span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-1">{question.title}</h5>
                        <p className="text-sm text-gray-600 line-clamp-2">{question.body}</p>
                      </div>
                      <button
                        onClick={() => handleAddQuestion(question)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableExamQuestions;
