'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import { examService } from '@/services/examService';

const StatusBadge = ({ status }) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
  const statusClasses = {
    live: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.archived}`}>{status}</span>;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

export default function ExamsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getExams,
  });

  return (
    <PageWrapper title="Exams">
      <div className="flex justify-end mb-4">
        <Link href="/exams/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Create Exam
        </Link>
      </div>

      {isLoading && <p>Loading exams...</p>}
      {error && <p className="text-red-500">Error loading exams.</p>}
      
      {data && (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{exam.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(exam.start_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(exam.end_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
