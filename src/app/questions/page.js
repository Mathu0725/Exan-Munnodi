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
      deleteManyMutation.mutate({ ids: [question.id] });
    }
  };

  const handleEdit = (question) => {
    alert('Edit is not implemented yet in this demo.');
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
      subject_id: q.subject_id,
      category_id: q.category_id,
      difficulty: q.difficulty,
      status: q.status,
      tags: Array.isArray(q.tags) ? q.tags.join('|') : '',
    }));

    const csv = unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'questions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const questions = data?.data || [];
  const meta = data?.meta;
  const isAllSelected = questions.length > 0 && selected.length === questions.length;

  return (
    <PageWrapper title="Question Bank">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {selected.length > 0 && (
            <>
              {user?.role !== 'Viewer' && (
                <button 
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
                  disabled={deleteManyMutation.isPending}
                >
                  {deleteManyMutation.isPending ? 'Deleting...' : `Delete Selected (${selected.length})`}
                </button>
              )}
              <button onClick={handleExportSelected} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                {`Export Selected (${selected.length})`}
              </button>
            </>
          )}
        </div>
        {user?.role !== 'Viewer' && (
          <Link href="/questions/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Add Question
          </Link>
        )}
      </div>

      <QuestionFilterBar filters={filters} onFilterChange={handleFilterChange} />

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <td className="px-6 py-4 whitespace-nowrap">{question.difficulty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={question.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openPreview(question)} className="text-gray-600 hover:text-gray-900 mr-4">Preview</button>
                    {user?.role !== 'Viewer' ? (
                      <>
                        <button onClick={() => handleEdit(question)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button onClick={() => openHistory(question)} className="text-gray-600 hover:text-gray-900 mr-4">History</button>
                        <button onClick={() => handleDeleteOne(question)} className="text-red-600 hover:text-red-900">Delete</button>
                      </>
                    ) : (
                      <span className="text-gray-400">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && (
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
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
            <div key={v.versionId} className="border rounded p-3">
              <div className="text-xs text-gray-500">{new Date(v.timestamp).toLocaleString()}</div>
              <div className="mt-2 text-sm">
                <div className="font-medium">{v.snapshot.title}</div>
                <div className="text-gray-600">Difficulty: {v.snapshot.difficulty} • Marks: {v.snapshot.marks}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </PageWrapper>
  );
}
