'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import ExamPreview from '@/components/exams/ExamPreview';
import { examService } from '@/services/examService';

export default function ExamPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await examService.getExam(params.id);
        setExam(res);
      } catch (e) {
        setError(e.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) load();
  }, [params?.id]);

  return (
    <PageWrapper title='Exam Preview'>
      {loading && <div>Loading...</div>}
      {error && <div className='text-red-600'>{error}</div>}
      {exam && (
        <div className='bg-white rounded shadow overflow-hidden'>
          <div className='p-4 border-b flex justify-between items-center'>
            <div className='font-semibold'>{exam.title}</div>
            <button
              onClick={() => router.back()}
              className='px-3 py-1 bg-gray-200 rounded'
            >
              Back
            </button>
          </div>
          <ExamPreview examData={exam} />
        </div>
      )}
    </PageWrapper>
  );
}
