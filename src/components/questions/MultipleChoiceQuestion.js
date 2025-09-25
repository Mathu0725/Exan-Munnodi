'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';
import LatexQuillEditor from './LatexQuillEditor';
import ImageUploader from './ImageUploader';
import OptionsEditor from './OptionsEditor';

export default function MultipleChoiceQuestion({ onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    body: initialData?.body || '',
    image: initialData?.image || null,
    subject_id: initialData?.subject_id || '',
    sub_subject_id: initialData?.sub_subject_id || '',
    category_id: initialData?.category_id || '',
    difficulty: initialData?.difficulty || 1,
    marks: initialData?.marks || 1,
    negative_marks: initialData?.negative_marks || 0,
    time_limit: initialData?.time_limit || '',
    options: initialData?.options || [
      { id: 'A', text: '', is_correct: false },
      { id: 'B', text: '', is_correct: false },
      { id: 'C', text: '', is_correct: false },
      { id: 'D', text: '', is_correct: false }
    ],
    answer_key: initialData?.answer_key || '',
    question_type: 'multiple_choice'
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
    mutationFn: (data) => {
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

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleOptionChange = (optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const handleAnswerKeyChange = (answerKey) => {
    setFormData(prev => ({
      ...prev,
      answer_key: answerKey,
      options: prev.options.map(opt => ({
        ...opt,
        is_correct: opt.id === answerKey
      }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Question body is required';
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.answer_key) {
      newErrors.answer_key = 'Correct answer is required';
    }

    // Check if all options have text
    const emptyOptions = formData.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      newErrors.options = 'All options must have text';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        subject_id: parseInt(formData.subject_id),
        sub_subject_id: formData.sub_subject_id ? parseInt(formData.sub_subject_id) : null,
        category_id: parseInt(formData.category_id),
        time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
        options: formData.options.map(opt => ({
          ...opt,
          is_correct: opt.id === formData.answer_key
        }))
      };
      
      await saveMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {initialData ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a traditional multiple choice question with options A, B, C, D
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter question title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Question Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Body *
          </label>
          <div className="tamil-support">
            <LatexQuillEditor
              value={formData.body}
              onChange={(value) => handleInputChange('body', value)}
              placeholder="Enter the question text..."
              className={`min-h-[200px] ${errors.body ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Image (Optional)
          </label>
          <ImageUploader
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            currentImage={formData.image}
            className="w-full"
          />
        </div>

        {/* Subject and Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => {
                handleInputChange('subject_id', e.target.value);
                handleInputChange('sub_subject_id', ''); // Reset sub-subject
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.subject_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select Subject</option>
              {subjectsData?.data?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sub-subject
            </label>
            <select
              value={formData.sub_subject_id}
              onChange={(e) => handleInputChange('sub_subject_id', e.target.value)}
              disabled={!formData.subject_id || isLoadingSubSubjects}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
            >
              <option value="">Select Sub-subject</option>
              {subSubjectsData?.data?.map((subSubject) => (
                <option key={subSubject.id} value={subSubject.id}>
                  {subSubject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select Category</option>
              {categoriesData?.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Answer Options *
          </label>
          <div className="space-y-3">
            {formData.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {option.id}
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder={`Enter option ${option.id}`}
                />
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="answer_key"
                    value={option.id}
                    checked={formData.answer_key === option.id}
                    onChange={(e) => handleAnswerKeyChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Correct</span>
                </label>
              </div>
            ))}
          </div>
          {errors.answer_key && <p className="text-red-500 text-sm mt-1">{errors.answer_key}</p>}
          {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.difficulty ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value={1}>1 - Very Easy</option>
              <option value={2}>2 - Easy</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - Hard</option>
              <option value={5}>5 - Very Hard</option>
            </select>
            {errors.difficulty && <p className="text-red-500 text-sm mt-1">{errors.difficulty}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marks *
            </label>
            <input
              type="number"
              min="1"
              value={formData.marks}
              onChange={(e) => handleInputChange('marks', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.marks ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Negative Marks
            </label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={formData.negative_marks}
              onChange={(e) => handleInputChange('negative_marks', parseFloat(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.negative_marks ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.negative_marks && <p className="text-red-500 text-sm mt-1">{errors.negative_marks}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              min="1"
              value={formData.time_limit}
              onChange={(e) => handleInputChange('time_limit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Question' : 'Create Question')}
          </button>
        </div>
      </form>
    </div>
  );
}
