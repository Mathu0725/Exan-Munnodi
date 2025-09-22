import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import QuestionFilterBar from '@/components/questions/QuestionFilterBar';
import DraggableQuestionList from './DraggableQuestionList';

export default function Step2Questions({ data, onNext, onBack }) {
  const [filters, setFilters] = useState({ page: 1, limit: 5 });
  const [selectedQuestions, setSelectedQuestions] = useState(data.questions || []);

  const { data: availableQuestionsData, isLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions(filters),
    keepPreviousData: true,
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
  };

  const handleAddQuestion = (question) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
  };

  const handleNextStep = () => {
    onNext({ questions: selectedQuestions });
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Questions Panel */}
        <div>
          <h3 className="text-lg font-medium mb-4">Available Questions</h3>
          <QuestionFilterBar filters={filters} onFilterChange={handleFilterChange} />
          {isLoading && <p>Loading...</p>}
          <div className="mt-4 space-y-2">
            {availableQuestionsData?.data.map((q) => (
              <div key={q.id} className="flex justify-between items-center p-2 border rounded-md">
                <span>{q.title}</span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion(q)}
                  disabled={!!selectedQuestions.find(sq => sq.id === q.id)}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
          {/* TODO: Add pagination for available questions */}
        </div>

        {/* Selected Questions Panel */}
        <div>
          <h3 className="text-lg font-medium mb-4">Selected Questions ({selectedQuestions.length})</h3>
          <DraggableQuestionList 
            questions={selectedQuestions}
            setQuestions={setSelectedQuestions}
            renderActions={(q) => (
              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.id)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded-md"
              >
                Remove
              </button>
            )}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 rounded-md">Back</button>
        <button type="button" onClick={handleNextStep} className="px-6 py-2 bg-indigo-600 text-white rounded-md">Next</button>
      </div>
    </div>
  );
}
