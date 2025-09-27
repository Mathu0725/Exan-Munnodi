'use client';

import { useEffect, useState } from 'react';
import { unparse } from 'papaparse';
import PageWrapper from '@/components/layout/PageWrapper';
import { examResultService } from '@/services/examResultService';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ExamResultsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await examResultService.listByExam(params.id);
      setRows(data);
      setLoading(false);
    };
    if (params?.id) load();
  }, [params?.id]);

  if (user?.role !== 'Admin') {
    return (
      <PageWrapper title="Results">
        <div className="text-red-600">Access denied. Admins only.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Exam Results">
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="bg-white rounded shadow overflow-auto">
          <div className="p-3 border-b flex justify-end">
            <button
              onClick={() => {
                const csv = unparse(rows.map(r => ({ submittedAt: r.submittedAt, userEmail: r.userEmail, obtained: r.obtained, total: r.total })));
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `exam_${params.id}_results.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 bg-indigo-600 text-white rounded"
            >
              Export CSV
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{new Date(r.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">{r.userEmail}</td>
                  <td className="px-4 py-2 text-sm">{r.obtained} / {r.total}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-sm text-gray-500" colSpan={3}>No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}


