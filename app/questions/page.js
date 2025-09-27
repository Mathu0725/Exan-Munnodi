'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { unparse } from 'papaparse';
import PageWrapper from '@/components/layout/PageWrapper';
import { questionService } from '@/services/questionService';
import QuestionFilterBar from '@/components/questions/QuestionFilterBar';
import Pagination from '@/components/shared/Pagination';
import Modal from '@/components/ui/Modal';
import QuestionPreview from '@/components/questions/QuestionPreview';
import QuickCleanup from '@/components/shared/QuickCleanup';

const StatusBadge = ({ status }) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  const statusClasses = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.archived}`}>{status}</span>;
};

export default function QuestionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState({ isOpen: false, question: null });
  const [history, setHistory] = useState({ isOpen: false, versions: [], title: '' });
  const [goToPage, setGoToPage] = useState('');
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions({ ...filters, filters }),
    keepPreviousData: true,
  });

  const deleteManyMutation = useMutation({
    mutationFn: questionService.deleteManyQuestions, // Assumes this service function exists
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      setSelected([]);
    },
  });

  const deleteOneMutation = useMutation({
    mutationFn: questionService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      // Update each question's status
      const promises = ids.map(id => 
        questionService.updateQuestion(id, { status })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      setSelected([]);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (questionId) => {
      // Get the original question
      const originalQuestion = await questionService.getQuestion(questionId);
      
      // Create a copy with modified title
      const duplicateData = {
        ...originalQuestion,
        title: `${originalQuestion.title} (Copy)`,
        status: 'draft'
      };
      
      // Remove the id so it creates a new question
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      
      return await questionService.createQuestion(duplicateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
    },
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
    setSelected([]);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    setSelected([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(questions.map(q => q.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelected(prev => [...prev, id]);
    } else {
      setSelected(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteOne = (question) => {
    if (window.confirm(`Delete question: "${question.title}"?`)) {
      deleteOneMutation.mutate(question.id);
    }
  };

  const handleEdit = (question) => {
    window.location.href = `/questions/${question.id}/edit`;
  };

  const openPreview = (q) => setPreview({ isOpen: true, question: q });
  const closePreview = () => setPreview({ isOpen: false, question: null });
  const openHistory = async (q) => {
    const res = await questionService.getQuestionVersions(q.id);
    setHistory({ isOpen: true, versions: res.data, title: q.title });
  };
  const closeHistory = () => setHistory({ isOpen: false, versions: [], title: '' });

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} selected questions?`)) {
      deleteManyMutation.mutate({ ids: selected });
    }
  };

  const handleExportSelected = () => {
    const questionsToExport = questions.filter(q => selected.includes(q.id));

    const dataForCsv = questionsToExport.map(q => ({
      id: q.id,
      title: q.title,
      body: q.body || '',
      subject_id: q.subjectId,
      sub_subject_id: q.subSubjectId || '',
      category_id: q.categoryId,
      difficulty: q.difficulty,
      marks: q.marks,
      negative_marks: q.negativeMarks || 0,
      time_limit: q.timeLimit || '',
      status: q.status,
      tags: Array.isArray(q.tags) ? q.tags.join('|') : '',
      question_type: q.question_type || 'multiple_choice',
      // Include options
      option_a: q.options?.[0]?.text || '',
      option_a_correct: q.options?.[0]?.isCorrect || false,
      option_b: q.options?.[1]?.text || '',
      option_b_correct: q.options?.[1]?.isCorrect || false,
      option_c: q.options?.[2]?.text || '',
      option_c_correct: q.options?.[2]?.isCorrect || false,
      option_d: q.options?.[3]?.text || '',
      option_d_correct: q.options?.[3]?.isCorrect || false,
      option_e: q.options?.[4]?.text || '',
      option_e_correct: q.options?.[4]?.isCorrect || false,
    }));

    const csv = unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `questions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkStatusUpdate = (status) => {
    if (window.confirm(`Update ${selected.length} questions to ${status} status?`)) {
      updateStatusMutation.mutate({ ids: selected, status });
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPage);
    if (page >= 1 && page <= meta?.totalPages) {
      handlePageChange(page);
      setGoToPage('');
    }
  };

  const handleDuplicate = (question) => {
    if (window.confirm(`Duplicate question: "${question.title}"?`)) {
      duplicateMutation.mutate(question.id);
    }
  };

  const cleanupDuplicatesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/questions/cleanup-duplicates', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Cleanup failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['questions']);
      alert(`Duplicate cleanup completed!\n\nRemoved ${data.stats.removedCount} duplicate questions from ${data.stats.duplicateGroups} groups.`);
    },
    onError: (error) => {
      alert(`Cleanup failed: ${error.message}`);
    },
  });

  const handleCleanupDuplicates = () => {
    if (window.confirm('This will scan all questions and remove duplicates. Continue?')) {
      cleanupDuplicatesMutation.mutate();
    }
  };

  const questions = data?.data || [];
  const meta = data?.meta;
  const isAllSelected = questions.length > 0 && selected.length === questions.length;

  return (
    <PageWrapper title="Question Bank">
      <QuickCleanup />
      
      <div className="flex justify-between items-center mb-6 mt-6">
        <div className="flex flex-wrap gap-3">
          {selected.length > 0 ? (
            <>
              {user?.role !== 'Viewer' && (
                <button 
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-red-400 transition-colors shadow-sm"
                  disabled={deleteManyMutation.isPending}
                >
                  {deleteManyMutation.isPending ? '⏳ Deleting...' : `🗑️ Delete Selected (${selected.length})`}
                </button>
              )}
              <button 
                onClick={handleExportSelected} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                📤 Export Selected ({selected.length})
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('published')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors shadow-sm"
                disabled={updateStatusMutation.isPending}
              >
                ✅ Publish Selected
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('draft')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors shadow-sm"
                disabled={updateStatusMutation.isPending}
              >
                📝 Draft Selected
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('archived')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 transition-colors shadow-sm"
                disabled={updateStatusMutation.isPending}
              >
                📦 Archive Selected
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-500 flex items-center">
              <span className="mr-2">💡</span>
              Select questions to perform bulk actions
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          {user?.role !== 'Viewer' && (
            <button
              onClick={handleCleanupDuplicates}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors shadow-sm flex items-center"
              disabled={cleanupDuplicatesMutation.isPending}
            >
              {cleanupDuplicatesMutation.isPending ? '⏳ Cleaning...' : '🧹 Clean Duplicates'}
            </button>
          )}
          {user?.role !== 'Viewer' && (
            <Link href="/questions/new" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
              <span className="mr-2">➕</span>
              Add Question
            </Link>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <QuestionFilterBar filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
            Show:
          </label>
          <select
            id="pageSize"
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">per page</span>
        </div>
      </div>

      {isLoading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">Error loading questions.</p>}
      
      {data && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id} className={selected.includes(question.id) ? 'bg-indigo-50' : ''}>
                  <td className="p-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" 
                      checked={selected.includes(question.id)}
                      onChange={(e) => handleSelectOne(e, question.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{question.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      question.question_type === 'section_based' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {question.question_type === 'section_based' ? 'Section-Based' : 'Multiple Choice'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{question.difficulty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={question.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button 
                        onClick={() => openPreview(question)} 
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        👁️ Preview
                      </button>
                      {user?.role !== 'Viewer' ? (
                        <>
                          <button 
                            onClick={() => handleEdit(question)} 
                            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDuplicate(question)} 
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                            disabled={duplicateMutation.isPending}
                          >
                            {duplicateMutation.isPending ? '⏳ Duplicating...' : '📋 Duplicate'}
                          </button>
                          <button 
                            onClick={() => openHistory(question)} 
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            📚 History
                          </button>
                          <button 
                            onClick={() => handleDeleteOne(question)} 
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors"
                            disabled={deleteOneMutation.isPending}
                          >
                            {deleteOneMutation.isPending ? '⏳ Deleting...' : '🗑️ Delete'}
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 rounded-md">Read-only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {((meta.currentPage - 1) * meta.pageSize) + 1} to {Math.min(meta.currentPage * meta.pageSize, meta.total)} of {meta.total} questions
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <form onSubmit={handleGoToPage} className="flex items-center space-x-2">
                    <label htmlFor="goToPage" className="text-sm text-gray-700">
                      Go to page:
                    </label>
                    <input
                      id="goToPage"
                      type="number"
                      min="1"
                      max={meta.totalPages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Page"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Go
                    </button>
                  </form>
                  <Pagination
                    currentPage={meta.currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Modal isOpen={preview.isOpen} onClose={closePreview} title="Question Preview">
        <QuestionPreview question={preview.question} />
      </Modal>
      <Modal isOpen={history.isOpen} onClose={closeHistory} title={`Version History - ${history.title}`}>
        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {history.versions.length === 0 && <div className="text-sm text-gray-500">No versions yet.</div>}
          {history.versions.map((v) => (
            <div key={v.versionId || v.id} className="border rounded p-3">
              <div className="text-xs text-gray-500">
                {v.timestamp ? new Date(v.timestamp).toLocaleString() : 
                 v.createdAt ? new Date(v.createdAt).toLocaleString() : 
                 'Unknown date'}
              </div>
              <div className="mt-2 text-sm">
                <div className="font-medium">
                  {v.snapshot?.title || v.title || 'Untitled'}
                </div>
                <div className="text-gray-600">
                  Difficulty: {v.snapshot?.difficulty || v.difficulty || 'N/A'} • 
                  Marks: {v.snapshot?.marks || v.marks || 'N/A'}
                </div>
                {v.author && (
                  <div className="text-xs text-gray-500 mt-1">
                    By: {v.author}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </PageWrapper>
  );
}
