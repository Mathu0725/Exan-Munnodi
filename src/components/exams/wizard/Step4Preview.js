'use client';
import ExamPreview from '@/components/exams/ExamPreview';

export default function Step4Preview({ data, onBack, onPublish, onEditStep }) {
  const {
    title,
    description,
    exam_type_id,
    start_at,
    end_at,
    questions = [],
    config = {},
  } = data || {};

  const handleEditDetails = () => (onEditStep ? onEditStep(0) : null);
  const handleEditQuestions = () => (onEditStep ? onEditStep(1) : null);
  const handleEditConfig = () => (onEditStep ? onEditStep(2) : null);

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Preview & Publish</h3>
        <div className='space-x-2'>
          <button onClick={onBack} className='px-4 py-2 bg-gray-200 rounded-md'>
            Back
          </button>
          <button
            onClick={() => onPublish('published')}
            className='px-4 py-2 bg-indigo-600 text-white rounded-md'
          >
            Publish
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <div>
            <div className='text-sm text-gray-500'>Title</div>
            <div className='font-medium'>{title || '-'}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Access Password</div>
            <div className='text-gray-700'>
              {config?.access_password ? '••••••' : '-'}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Description</div>
            <div className='text-gray-700'>{description || '-'}</div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm text-gray-500'>Exam Type</div>
              <div className='text-gray-700'>{exam_type_id || '-'}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>Questions</div>
              <div className='text-gray-700'>{questions.length}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>Start</div>
              <div className='text-gray-700'>{start_at || '-'}</div>
            </div>
            <div>
              <div className='text-sm text-gray-500'>End</div>
              <div className='text-gray-700'>{end_at || '-'}</div>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='text-sm text-gray-500'>Configuration (read-only)</div>
          <pre className='text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64'>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>

      <div>
        <div className='text-sm text-gray-500 mb-2'>Full Exam Preview</div>
        <div className='rounded border overflow-hidden'>
          <ExamPreview
            examData={data}
            onEditDetails={handleEditDetails}
            onEditQuestions={handleEditQuestions}
            onEditConfig={handleEditConfig}
          />
        </div>
      </div>
    </div>
  );
}
