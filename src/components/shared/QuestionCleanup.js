'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';
import { examService } from '@/services/examService';

export default function QuestionCleanup() {
  const [selectedFilters, setSelectedFilters] = useState({
    noCategory: true,
    noSubject: true,
    noSubSubject: false,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [orphanedQuestions, setOrphanedQuestions] = useState([]);

  const queryClient = useQueryClient();

  // Fetch all questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions-cleanup'],
    queryFn: () => questionService.getQuestions({ page: 1, limit: 1000 }),
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-cleanup'],
    queryFn: () => subjectService.getSubjects({ limit: 1000 }),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-cleanup'],
    queryFn: () => categoryService.getAll(),
  });

  // Delete questions mutation
  const deleteQuestionsMutation = useMutation({
    mutationFn: async (questionIds) => {
      const results = [];
      for (const id of questionIds) {
        try {
          await questionService.deleteQuestion(id);
          results.push({ id, success: true });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      queryClient.invalidateQueries(['questions-cleanup']);
    },
  });

  const scanForOrphanedQuestions = async () => {
    setIsScanning(true);
    
    const questions = questionsData?.data || [];
    const subjects = subjectsData?.data || [];
    const categories = categoriesData?.data || [];

    const orphaned = [];
    
    for (const question of questions) {
      const issues = [];

      // Check for missing category
      if (selectedFilters.noCategory && (!question.category_id || !categories.find(c => c.id === question.category_id))) {
        issues.push('No valid category');
      }

      // Check for missing subject
      if (selectedFilters.noSubject && (!question.subject_id || !subjects.find(s => s.id === question.subject_id))) {
        issues.push('No valid subject');
      }

      // Check for missing sub-subject (if required)
      if (selectedFilters.noSubSubject && question.sub_subject_id && !subjects.find(s => s.subsubjects?.find(ss => ss.id === question.sub_subject_id))) {
        issues.push('No valid sub-subject');
      }

      if (issues.length > 0) {
        // Check if question is used in live exams
        try {
          const liveExamsResult = await examService.getLiveExamsUsingQuestion(question.id);
          const liveExams = liveExamsResult?.data || [];
          
          if (liveExams.length > 0) {
            issues.push(`Used in ${liveExams.length} live exam(s): ${liveExams.map(e => e.title).join(', ')}`);
          }
        } catch (error) {
          console.warn('Failed to check exam dependencies for question', question.id, error);
        }

        orphaned.push({
          ...question,
          issues,
          isProtected: liveExams.length > 0
        });
      }
    }

    setOrphanedQuestions(orphaned);
    setIsScanning(false);
  };

  const handleDeleteSelected = async (questionIds) => {
    // Filter out protected questions
    const protectedQuestions = orphanedQuestions.filter(q => questionIds.includes(q.id) && q.isProtected);
    const deletableIds = questionIds.filter(id => !orphanedQuestions.find(q => q.id === id && q.isProtected));
    
    if (protectedQuestions.length > 0) {
      alert(`Cannot delete ${protectedQuestions.length} question(s) because they are used in live exams:\n${protectedQuestions.map(q => `- ${q.title} (ID: ${q.id})`).join('\n')}`);
    }
    
    if (deletableIds.length === 0) {
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${deletableIds.length} questions? This action cannot be undone.`)) {
      await deleteQuestionsMutation.mutateAsync(deletableIds);
      setOrphanedQuestions(prev => prev.filter(q => !deletableIds.includes(q.id)));
    }
  };

  const handleDeleteAll = async () => {
    const deletableQuestions = orphanedQuestions.filter(q => !q.isProtected);
    const protectedQuestions = orphanedQuestions.filter(q => q.isProtected);
    
    if (protectedQuestions.length > 0) {
      alert(`Cannot delete ${protectedQuestions.length} question(s) because they are used in live exams:\n${protectedQuestions.map(q => `- ${q.title} (ID: ${q.id})`).join('\n')}`);
    }
    
    if (deletableQuestions.length === 0) {
      return;
    }
    
    const allIds = deletableQuestions.map(q => q.id);
    await handleDeleteSelected(allIds);
  };

  const getQuestionIssues = (question) => {
    const issues = [];
    const subjects = subjectsData?.data || [];
    const categories = categoriesData?.data || [];

    if (!question.category_id || !categories.find(c => c.id === question.category_id)) {
      issues.push('No valid category');
    }

    if (!question.subject_id || !subjects.find(s => s.id === question.subject_id)) {
      issues.push('No valid subject');
    }

    if (question.sub_subject_id && !subjects.find(s => s.subsubjects?.find(ss => ss.id === question.sub_subject_id))) {
      issues.push('No valid sub-subject');
    }

    return issues;
  };

  if (questionsLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Question Cleanup Tool
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Questions: {questionsData?.data?.length || 0}
        </div>
      </div>

      {/* Filter Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Filter Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFilters.noCategory}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, noCategory: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No Category</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFilters.noSubject}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, noSubject: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No Subject</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFilters.noSubSubject}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, noSubSubject: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">No Sub-subject</span>
          </label>
        </div>
      </div>

      {/* Scan Button */}
      <div className="flex space-x-3">
        <button
          onClick={scanForOrphanedQuestions}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? 'Scanning...' : 'Scan for Orphaned Questions'}
        </button>
        
        {orphanedQuestions.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={deleteQuestionsMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete All ({orphanedQuestions.filter(q => !q.isProtected).length})
          </button>
        )}
      </div>

      {/* Results */}
      {orphanedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Found {orphanedQuestions.length} orphaned questions
            </h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {deleteQuestionsMutation.isPending && 'Deleting...'}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {orphanedQuestions.map((question) => {
              const issues = question.issues || getQuestionIssues(question);
              const isProtected = question.isProtected;
              
              return (
                <div
                  key={question.id}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    isProtected 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {question.title}
                      </div>
                      {isProtected && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                          Protected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Issues: {issues.join(', ')}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ID: {question.id} | Category: {question.category_id || 'None'} | Subject: {question.subject_id || 'None'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSelected([question.id])}
                    disabled={deleteQuestionsMutation.isPending || isProtected}
                    className={`px-3 py-1 text-xs rounded ${
                      isProtected
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    } disabled:opacity-50`}
                    title={isProtected ? 'Cannot delete: Used in live exam(s)' : 'Delete question'}
                  >
                    {isProtected ? 'Protected' : 'Delete'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {orphanedQuestions.length === 0 && !isScanning && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No orphaned questions found with current filters.</p>
        </div>
      )}
    </div>
  );
}
