'use client';

import dynamic from 'next/dynamic';
const LatexQuillViewer = dynamic(
  () => import('@/components/questions/LatexQuillEditor'),
  { ssr: false }
);
import 'react-quill/dist/quill.bubble.css'; // Use bubble theme for read-only
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';

export default function ExamPreview({
  examData,
  onEditDetails,
  onEditQuestions,
  onEditConfig,
}) {
  const title = examData?.title || examData?.name || 'Untitled Exam';
  const description = examData?.description || examData?.summary || '';
  const questions = Array.isArray(examData?.questions)
    ? examData.questions
    : [];
  const config = examData?.config || {};

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const pageSize = 20;
  const totalQuestions = questions.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / pageSize));
  const [page, setPage] = useState(1);
  const pageQuestions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, page]);

  return (
    <div className='bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg'>
        <header className='border-b pb-4 mb-6'>
          <h1 className='text-3xl font-bold text-gray-800'>{title}</h1>
          {description && <p className='mt-2 text-gray-600'>{description}</p>}
          <div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600'>
            <span>Total Questions: {totalQuestions}</span>
            {config?.total_time_minutes ? (
              <span>Total Time: {config.total_time_minutes} min</span>
            ) : null}
            <span>Showing {pageSize} per page</span>
          </div>
          {isAdmin && (onEditDetails || onEditQuestions || onEditConfig) && (
            <div className='mt-4 flex flex-wrap gap-3 text-sm'>
              {onEditDetails && (
                <button
                  onClick={onEditDetails}
                  className='px-3 py-1 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50'
                >
                  Edit Exam Details
                </button>
              )}
              {onEditQuestions && (
                <button
                  onClick={onEditQuestions}
                  className='px-3 py-1 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50'
                >
                  Edit Questions
                </button>
              )}
              {onEditConfig && (
                <button
                  onClick={onEditConfig}
                  className='px-3 py-1 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50'
                >
                  Edit Configuration
                </button>
              )}
            </div>
          )}
        </header>

        {isAdmin && (
          <div className='mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3'>
            Admin view: Correct answers are highlighted.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        <div className='space-y-8'>
          {pageQuestions.map((q, index) => (
            <div key={q.id || index} className='border-b pb-6'>
              <div className='flex items-start'>
                <div className='font-bold text-lg text-gray-700 mr-4'>
                  {(page - 1) * pageSize + index + 1}.
                </div>
                <div className='flex-1'>
                  <div className='prose ql-editor'>
                    <LatexQuillViewer
                      value={q.body || q.title || ''}
                      readOnly={true}
                      theme='bubble'
                    />
                  </div>
                  <div className='mt-4 space-y-2'>
                    {(q.options || []).map((opt, optIndex) => {
                      const isCorrect =
                        opt.is_correct ?? opt.isCorrect ?? false;
                      const highlightClasses =
                        isAdmin && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200';
                      return (
                        <div
                          key={opt.id || optIndex}
                          className={`flex items-center p-2 border rounded-md ${highlightClasses}`}
                        >
                          <input
                            type='radio'
                            name={`question-${index}`}
                            id={`q-${index}-opt-${optIndex}`}
                            className='mr-3'
                            disabled
                          />
                          <label
                            htmlFor={`q-${index}-opt-${optIndex}`}
                            className='flex-1'
                          >
                            {opt.text || opt.label || ''}
                          </label>
                          {isAdmin && isCorrect && (
                            <span className='ml-2 text-xs font-medium text-green-700'>
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        <footer className='mt-8 text-center'>
          <p className='text-gray-500'>End of Preview</p>
        </footer>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages = [];
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
  return (
    <div className='my-4 flex items-center justify-between'>
      <button
        onClick={prev}
        disabled={page === 1}
        className='px-3 py-1 border rounded disabled:opacity-50'
      >
        Previous
      </button>
      <div className='space-x-1'>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 border rounded ${p === page ? 'bg-indigo-600 text-white' : ''}`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={page === totalPages}
        className='px-3 py-1 border rounded disabled:opacity-50'
      >
        Next
      </button>
    </div>
  );
}
