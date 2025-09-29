'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';
import LatexQuillEditor from './LatexQuillEditor';
import ImageUploader from './ImageUploader';

export default function SectionBasedQuestion({
  onSave,
  onCancel,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startQuestion: initialData?.startQuestion || 1,
    endQuestion: initialData?.endQuestion || 5,
    image: initialData?.image || null,
    subject_id: initialData?.subject_id || '',
    sub_subject_id: initialData?.sub_subject_id || '',
    category_id: initialData?.category_id || '',
    difficulty: initialData?.difficulty || 1,
    marks: initialData?.marks || 1,
    negative_marks: initialData?.negative_marks || 0,
    question_type: 'section_based',
    questions: initialData?.questions || [], // Array of individual questions
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects({ limit: 100 }),
  });

  // Fetch sub-subjects based on selected subject
  const { data: subSubjectsData, isLoading: isLoadingSubSubjects } = useQuery({
    queryKey: ['subSubjects', formData.subject_id],
    queryFn: () => subjectService.getSubSubjects(formData.subject_id),
    enabled: !!formData.subject_id,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: data => {
      if (initialData) {
        return questionService.updateQuestion(initialData.id, data);
      } else {
        return questionService.createQuestion(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      onSave?.();
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageUpload = imageUrl => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      title: '',
      description: '',
      options: [
        { id: 'A', text: '', is_correct: false },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false },
      ],
      correct_answer: '',
      image: null,
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = questionId => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  };

  const updateQuestionOption = (questionId, optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId ? { ...opt, [field]: value } : opt
              ),
            }
          : q
      ),
    }));
  };

  const handleQuestionImageUpload = (questionId, imageUrl) => {
    updateQuestion(questionId, 'image', imageUrl);
  };

  const handleQuestionImageRemove = questionId => {
    updateQuestion(questionId, 'image', null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (formData.startQuestion < 1) {
      newErrors.startQuestion = 'Start question must be at least 1';
    }

    if (formData.endQuestion < formData.startQuestion) {
      newErrors.endQuestion =
        'End question must be greater than or equal to start question';
    }

    if (formData.difficulty < 1 || formData.difficulty > 5) {
      newErrors.difficulty = 'Difficulty must be between 1 and 5';
    }

    if (formData.marks < 1) {
      newErrors.marks = 'Marks must be at least 1';
    }

    if (formData.negative_marks < 0) {
      newErrors.negative_marks = 'Negative marks cannot be negative';
    }

    // Validate individual questions
    if (formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    } else {
      formData.questions.forEach((question, index) => {
        if (!question.title.trim()) {
          newErrors[`question_${index}_title`] =
            `Question ${index + 1} title is required`;
        }
        if (!question.description.trim()) {
          newErrors[`question_${index}_description`] =
            `Question ${index + 1} description is required`;
        }
        if (!question.correct_answer) {
          newErrors[`question_${index}_correct_answer`] =
            `Question ${index + 1} correct answer is required`;
        }

        // Check if all options have text
        const emptyOptions = question.options.filter(opt => !opt.text.trim());
        if (emptyOptions.length > 0) {
          newErrors[`question_${index}_options`] =
            `Question ${index + 1} all options must have text`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving section-based question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionRange = formData.endQuestion - formData.startQuestion + 1;

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
          {initialData
            ? 'Edit Section-Based Question'
            : 'Create Section-Based Question'}
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Create a question with a description and specify a range of questions
          (e.g., Questions 1-5)
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Question Title *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.title
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder='Enter question title'
            />
            {errors.title && (
              <p className='text-red-500 text-sm mt-1'>{errors.title}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Question Range *
            </label>
            <div className='flex items-center space-x-2'>
              <input
                type='number'
                min='1'
                value={formData.startQuestion}
                onChange={e =>
                  handleInputChange('startQuestion', parseInt(e.target.value))
                }
                className={`w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  errors.startQuestion
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <span className='text-gray-500 dark:text-gray-400'>to</span>
              <input
                type='number'
                min='1'
                value={formData.endQuestion}
                onChange={e =>
                  handleInputChange('endQuestion', parseInt(e.target.value))
                }
                className={`w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  errors.endQuestion
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                ({questionRange} question{questionRange !== 1 ? 's' : ''})
              </span>
            </div>
            {errors.startQuestion && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.startQuestion}
              </p>
            )}
            {errors.endQuestion && (
              <p className='text-red-500 text-sm mt-1'>{errors.endQuestion}</p>
            )}
          </div>
        </div>

        {/* Paragraph/Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            📄 Paragraph/Description *
          </label>
          <div className='mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md'>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              <strong>Instructions:</strong> Write the main paragraph or
              description that students will read. This will be the basis for
              the quiz questions below.
            </p>
          </div>
          <div className='tamil-support'>
            <LatexQuillEditor
              value={formData.description}
              onChange={value => handleInputChange('description', value)}
              placeholder='Enter the paragraph or description that students will read...'
              className={`min-h-[200px] ${errors.description ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.description && (
            <p className='text-red-500 text-sm mt-1'>{errors.description}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            🖼️ Image (Optional)
          </label>
          <div className='mb-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md'>
            <p className='text-sm text-green-800 dark:text-green-200'>
              <strong>Tip:</strong> Upload an image that relates to your
              paragraph. Students will see both the image and paragraph before
              answering the quiz questions.
            </p>
          </div>
          <ImageUploader
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            currentImage={formData.image}
            className='w-full'
          />
        </div>

        {/* Subject and Category */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={e => {
                handleInputChange('subject_id', e.target.value);
                handleInputChange('sub_subject_id', ''); // Reset sub-subject
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.subject_id
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value=''>Select Subject</option>
              {subjectsData?.data?.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className='text-red-500 text-sm mt-1'>{errors.subject_id}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Sub-subject
            </label>
            <select
              value={formData.sub_subject_id}
              onChange={e =>
                handleInputChange('sub_subject_id', e.target.value)
              }
              disabled={!formData.subject_id || isLoadingSubSubjects}
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600'
            >
              <option value=''>Select Sub-subject</option>
              {subSubjectsData?.data?.map(subSubject => (
                <option key={subSubject.id} value={subSubject.id}>
                  {subSubject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={e => handleInputChange('category_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.category_id
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value=''>Select Category</option>
              {categoriesData?.data?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className='text-red-500 text-sm mt-1'>{errors.category_id}</p>
            )}
          </div>
        </div>

        {/* Question Settings */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={e =>
                handleInputChange('difficulty', parseInt(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.difficulty
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value={1}>1 - Very Easy</option>
              <option value={2}>2 - Easy</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - Hard</option>
              <option value={5}>5 - Very Hard</option>
            </select>
            {errors.difficulty && (
              <p className='text-red-500 text-sm mt-1'>{errors.difficulty}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Marks per Question *
            </label>
            <input
              type='number'
              min='1'
              value={formData.marks}
              onChange={e =>
                handleInputChange('marks', parseInt(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.marks
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.marks && (
              <p className='text-red-500 text-sm mt-1'>{errors.marks}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Negative Marks
            </label>
            <input
              type='number'
              min='0'
              step='0.25'
              value={formData.negative_marks}
              onChange={e =>
                handleInputChange('negative_marks', parseFloat(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.negative_marks
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.negative_marks && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.negative_marks}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Total Marks
            </label>
            <div className='px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300'>
              {formData.marks * questionRange}
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {formData.marks} marks × {questionRange} questions
            </p>
          </div>
        </div>

        {/* Quiz Questions */}
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
              ❓ Quiz Questions ({formData.questions.length})
            </h3>
            <button
              type='button'
              onClick={addQuestion}
              className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
            >
              + Add Quiz Question
            </button>
          </div>

          <div className='mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              <strong>📝 Instructions:</strong> Create quiz questions based on
              the image and paragraph above. Each question should test
              students&apos; understanding of the content. Use 4 answer options
              (A, B, C, D) and select the correct answer.
            </p>
          </div>

          {errors.questions && (
            <p className='text-red-500 text-sm mb-4'>{errors.questions}</p>
          )}

          <div className='space-y-6'>
            {formData.questions.map((question, index) => (
              <div
                key={question.id}
                className='border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800'
              >
                <div className='flex justify-between items-center mb-6'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 dark:text-blue-400 font-bold text-sm'>
                        {index + 1}
                      </span>
                    </div>
                    <h4 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                      Question {index + 1}
                    </h4>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeQuestion(question.id)}
                    className='px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600'
                  >
                    Remove
                  </button>
                </div>

                {/* Question Title */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Question Title *
                  </label>
                  <input
                    type='text'
                    value={question.title}
                    onChange={e =>
                      updateQuestion(question.id, 'title', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                      errors[`question_${index}_title`]
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='Enter question title'
                  />
                  {errors[`question_${index}_title`] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[`question_${index}_title`]}
                    </p>
                  )}
                </div>

                {/* Question Description */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Question Description *
                  </label>
                  <div className='tamil-support'>
                    <LatexQuillEditor
                      value={question.description}
                      onChange={value =>
                        updateQuestion(question.id, 'description', value)
                      }
                      placeholder='Enter the question description...'
                      className={`min-h-[150px] ${errors[`question_${index}_description`] ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors[`question_${index}_description`] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[`question_${index}_description`]}
                    </p>
                  )}
                </div>

                {/* Question Image */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Question Image (Optional)
                  </label>
                  <ImageUploader
                    onImageUpload={url =>
                      handleQuestionImageUpload(question.id, url)
                    }
                    onImageRemove={() => handleQuestionImageRemove(question.id)}
                    currentImage={question.image}
                    className='w-full'
                  />
                </div>

                {/* Options */}
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                    Answer Options (4 Options Required) *
                  </label>
                  <div className='grid grid-cols-1 gap-4'>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className='flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700'
                      >
                        <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400'>
                          {option.id}
                        </div>
                        <input
                          type='text'
                          value={option.text}
                          onChange={e =>
                            updateQuestionOption(
                              question.id,
                              option.id,
                              'text',
                              e.target.value
                            )
                          }
                          className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100'
                          placeholder={`Option ${option.id} - Enter answer text`}
                        />
                        <label className='flex items-center space-x-2 cursor-pointer'>
                          <input
                            type='radio'
                            name={`correct_answer_${question.id}`}
                            value={option.id}
                            checked={question.correct_answer === option.id}
                            onChange={e =>
                              updateQuestion(
                                question.id,
                                'correct_answer',
                                e.target.value
                              )
                            }
                            className='h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300'
                          />
                          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                            Correct Answer
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors[`question_${index}_options`] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[`question_${index}_options`]}
                    </p>
                  )}
                  {errors[`question_${index}_correct_answer`] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[`question_${index}_correct_answer`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-lg'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-4'>
            📋 Preview
          </h3>
          <div className='space-y-4'>
            <div className='font-medium text-gray-900 dark:text-gray-100 text-lg'>
              {formData.title || 'Question Title'}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Questions {formData.startQuestion} to {formData.endQuestion} (
              {questionRange} questions)
            </div>

            {formData.image && (
              <div className='mt-3'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  🖼️ Image:
                </div>
                <img
                  src={formData.image}
                  alt='Question image'
                  className='max-w-sm h-auto rounded border'
                />
              </div>
            )}

            {formData.description && (
              <div className='mt-3'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  📄 Paragraph:
                </div>
                <div className='text-sm text-gray-700 dark:text-gray-300 p-3 bg-white dark:bg-gray-800 rounded border'>
                  <div
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                </div>
              </div>
            )}
            {formData.questions.length > 0 && (
              <div className='mt-4'>
                <div className='text-sm font-medium text-gray-800 dark:text-gray-200 mb-3'>
                  ❓ Quiz Questions ({formData.questions.length}):
                </div>
                <div className='space-y-4'>
                  {formData.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className='p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600'
                    >
                      <div className='flex items-center space-x-2 mb-3'>
                        <span className='w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-sm font-bold text-green-600 dark:text-green-400'>
                          {idx + 1}
                        </span>
                        <span className='font-medium text-gray-900 dark:text-gray-100'>
                          {q.title || 'Untitled Question'}
                        </span>
                      </div>
                      {q.description && (
                        <div className='text-sm text-gray-600 dark:text-gray-400 ml-10 mb-3'>
                          {q.description
                            .replace(/<[^>]*>/g, '')
                            .substring(0, 150)}
                          ...
                        </div>
                      )}
                      <div className='ml-10'>
                        <div className='text-xs text-gray-500 dark:text-gray-500 mb-2'>
                          Options: A, B, C, D • Correct:{' '}
                          {q.correct_answer || 'Not set'}
                        </div>
                        {q.options && q.options.length > 0 && (
                          <div className='grid grid-cols-2 gap-2 text-xs'>
                            {q.options.map(opt => (
                              <div
                                key={opt.id}
                                className={`p-2 rounded ${opt.is_correct ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                              >
                                <span className='font-medium'>{opt.id}:</span>{' '}
                                {opt.text || 'Empty'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting
              ? 'Saving...'
              : initialData
                ? 'Update Question'
                : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}
