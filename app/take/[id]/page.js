'use client';

import { useEffect, useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import ExamRunner from '@/components/exams/ExamRunner';
import { examService } from '@/services/examService';
import { useParams, useRouter } from 'next/navigation';

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const e = await examService.getExam(params.id);
        setExam(e);
      } catch (err) {
        setError(err.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) load();
  }, [params?.id]);

  return (
    <PageWrapper title="Take Exam">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {exam && (
        <div>
          {exam?.config?.access_password ? (
            <PasswordGate expected={exam.config.access_password}>
              <ExamRunner exam={exam} />
            </PasswordGate>
          ) : (
            <ExamRunner exam={exam} />
          )}
        </div>
      )}
      {!loading && !exam && !error && (
        <div className="text-gray-600">Exam not found.</div>
      )}
      <div className="mt-4">
        <button onClick={() => router.back()} className="px-3 py-1 bg-gray-200 rounded">Back</button>
      </div>
    </PageWrapper>
  );
}

function PasswordGate({ expected, children }) {
  const [ok, setOk] = useState(false);
  const [val, setVal] = useState('');
  if (ok) return children;
  return (
    <div className="bg-white p-6 rounded border max-w-md">
      <div className="mb-2 font-medium">Enter Exam Password</div>
      <input value={val} onChange={(e) => setVal(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />
      <button onClick={() => setOk(val === expected)} className="px-4 py-2 bg-indigo-600 text-white rounded">Start Exam</button>
    </div>
  );
}


