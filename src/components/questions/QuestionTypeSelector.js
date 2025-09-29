'use client';

import { useState } from 'react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import SectionBasedQuestion from './SectionBasedQuestion';

const questionTypes = [
  {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description:
      'Traditional multiple choice questions with options A, B, C, D',
    icon: '📝',
    component: MultipleChoiceQuestion,
  },
  {
    id: 'section_based',
    name: 'Section-Based Question',
    description: 'Questions with description and range (e.g., Questions 1-5)',
    icon: '📋',
    component: SectionBasedQuestion,
  },
];

export default function QuestionTypeSelector({
  onSave,
  onCancel,
  initialData = null,
}) {
  const [selectedType, setSelectedType] = useState(
    initialData?.question_type || null
  );

  const handleTypeSelect = type => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSave = () => {
    onSave?.();
  };

  const handleCancel = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      onCancel?.();
    }
  };

  if (selectedType) {
    const typeConfig = questionTypes.find(t => t.id === selectedType);
    const Component = typeConfig?.component;

    if (Component) {
      return (
        <Component
          onSave={handleSave}
          onCancel={handleBack}
          initialData={initialData}
        />
      );
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
          {initialData ? 'Edit Question' : 'Create New Question'}
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Choose the type of question you want to create
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {questionTypes.map(type => (
          <div
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className='p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group'
          >
            <div className='flex items-start space-x-4'>
              <div className='text-3xl'>{type.icon}</div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300'>
                  {type.name}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 mt-2'>
                  {type.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          onClick={handleCancel}
          className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
