'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';

export default function QuickCleanup() {
  const [isScanning, setIsScanning] = useState(false);
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: questionsData } = useQuery({
    queryKey: ['questions-quick-cleanup'],
    queryFn: () => questionService.getQuestions({ page: 1, limit: 1000 }),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-quick-cleanup'],
    queryFn: () => subjectService.getSubjects({ limit: 1000 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-quick-cleanup'],
    queryFn: () => categoryService.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
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
      queryClient.invalidateQueries(['questions-quick-cleanup']);
      setOrphanedCount(0);
    },
  });

  const scanForOrphaned = async () => {
    setIsScanning(true);
    
    const questions = questionsData?.data || [];
    const subjects = subjectsData?.data || [];
    const categories = categoriesData?.data || [];

    const orphaned = [];
    
    for (const question of questions) {
      let isOrphaned = false;
      
      // Check for missing category
      if (!question.category_id || !categories.find(c => c.id === question.category_id)) {
        isOrphaned = true;
      }

      // Check for missing subject
      if (!question.subject_id || !subjects.find(s => s.id === question.subject_id)) {
        isOrphaned = true;
      }

      if (isOrphaned) {
        // Check if question is used in live exams
        orphaned.push(question);
      }
    }

    setOrphanedCount(orphaned.length);
    setIsScanning(false);
  };

  const handleDeleteAll = async () => {
    if (orphanedCount === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${orphanedCount} orphaned questions? This action cannot be undone.`)) {
      const questions = questionsData?.data || [];
      const subjects = subjectsData?.data || [];
      const categories = categoriesData?.data || [];

      const orphanedIds = questions
        .filter(question => {
          if (!question.category_id || !categories.find(c => c.id === question.category_id)) {
            return true;
          }
          if (!question.subject_id || !subjects.find(s => s.id === question.subject_id)) {
            return true;
          }
          return false;
        })
        .map(q => q.id);

      await deleteMutation.mutateAsync(orphanedIds);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Question Cleanup
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Clean up questions with missing categories or subjects
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={scanForOrphaned}
            disabled={isScanning}
            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Scan'}
          </button>
          
          {orphanedCount > 0 && (
            <>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                {orphanedCount} orphaned
              </span>
              <button
                onClick={handleDeleteAll}
                disabled={deleteMutation.isPending}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete All'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {orphanedCount > 0 && (
        <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-300">
          ⚠️ Found {orphanedCount} questions with missing categories or subjects. 
          <a 
            href="/question-cleanup" 
            className="text-yellow-800 dark:text-yellow-200 underline ml-1"
          >
            View details
          </a>
        </div>
      )}
    </div>
  );
}
