'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import { examService } from '@/services/examService';
import withRole from '@/components/auth/withRole';
import { notificationService } from '@/services/notificationService';

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

function ExamsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getExams,
  });

  return (
    <PageWrapper title="Exams">
      <div className="flex justify-end mb-4">
        {user?.role !== 'Viewer' && (
          <Link href="/exams/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Create Exam
          </Link>
        )}
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
                    <select
                      defaultValue={exam.status}
                      onChange={async (e) => {
                        const status = e.target.value;
                        await examService.updateExam(exam.id, { status });
                        location.reload();
                      }}
                      className="mr-3 px-2 py-1 border rounded"
                    >
                      <option value="draft">draft</option>
                      <option value="scheduled">scheduled</option>
                      <option value="live">live</option>
                      <option value="archived">archived</option>
                    </select>
                    <Link href={`/exams/${exam.id}/preview`} className="text-gray-700 hover:text-gray-900 mr-4">Preview</Link>
                    <Link href={`/exams/${exam.id}/results`} className="text-gray-700 hover:text-gray-900 mr-4">Results</Link>
                    <Link href={`/exams/new?clone=${exam.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                    <button onClick={async () => {
                      const to = prompt('Enter recipient emails (comma separated):', 'student@example.com');
                      if (to === null) return;
                      const pwd = prompt('Enter exam access password to include (leave blank to skip):') || '';
                      const msg = `Exam: ${exam.title}\nPassword: ${pwd || '(none)'}\nStart: ${formatDate(exam.start_at)} End: ${formatDate(exam.end_at)}\nPortal: https://your-portal.example`;
                      const res = await notificationService.sendExamNotification({ examId: exam.id, subject: `Exam Access - ${exam.title}`, message: msg, recipients: to.split(',').map(s => s.trim()).filter(Boolean) });
                      alert(res?.success ? 'Email sent.' : 'Notification queued.');
                    }} className="text-green-700 hover:text-green-900 mr-4">Notify</button>
                    <button onClick={() => alert('Delete not implemented in demo')} className="text-red-600 hover:text-red-900">Delete</button>
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

export default withRole(ExamsPage, ['Admin', 'Content Editor', 'Viewer']);
