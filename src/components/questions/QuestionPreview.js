'use client';

export default function QuestionPreview({ question }) {
  if (!question) return null;

  const { 
    title, 
    body, 
    description, 
    image_url, 
    image, 
    options = [], 
    difficulty, 
    marks, 
    time_limit,
    question_type,
    startQuestion,
    endQuestion
  } = question;

  const questionImage = image_url || image;
  const questionBody = body || description;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        
        {/* Question Type Indicator */}
        {question_type === 'section_based' && (
          <div className="mt-2 mb-3">
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Section-Based Question
            </span>
            {startQuestion && endQuestion && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Questions {startQuestion} to {endQuestion} ({endQuestion - startQuestion + 1} questions)
              </span>
            )}
          </div>
        )}

        {typeof questionBody === 'string' && questionBody.length > 0 && (
          <div className="prose max-w-none mt-2 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: questionBody }} />
        )}
        
        {questionImage && (
          <div className="mt-3">
            <img src={questionImage} alt="Question" className="max-h-64 rounded border" />
          </div>
        )}
      </div>

      {/* Multiple Choice Options */}
      {question_type === 'multiple_choice' && options.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</h4>
          <ul className="space-y-2">
            {options.map((opt) => (
              <li key={opt.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded flex items-start gap-2 bg-gray-50 dark:bg-gray-700">
                <span className={`mt-1 inline-block h-2 w-2 rounded-full ${opt.is_correct ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                <span className="text-gray-900 dark:text-gray-100">{opt.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section-Based Question Info */}
      {question_type === 'section_based' && startQuestion && endQuestion && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Question Range</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This question covers questions {startQuestion} through {endQuestion} 
            (total: {endQuestion - startQuestion + 1} questions)
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Total marks: {marks * (endQuestion - startQuestion + 1)} 
            ({marks} marks × {endQuestion - startQuestion + 1} questions)
          </p>
        </div>
      )}

      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Difficulty: {difficulty}</span>
        <span>Marks: {marks}</span>
        {time_limit ? <span>Time: {time_limit}s</span> : null}
        {question_type && <span>Type: {question_type.replace('_', ' ')}</span>}
      </div>
    </div>
  );
}


