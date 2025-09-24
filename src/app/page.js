'use client';

import { useQuery } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import { analyticsService } from '@/services/analyticsService';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { examService } from '@/services/examService';
import { examResultService } from '@/services/examResultService';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: analyticsService.getDashboardStats,
  });
  const { data: examsData } = useQuery({
    queryKey: ['exams-list-for-dashboard'],
    queryFn: examService.getExams,
  });
  const { data: studentResults } = useQuery({
    queryKey: ['my-results', user?.email],
    queryFn: async () => user?.email ? (await examResultService.listByExam(-1)) : [],
    enabled: !!user?.email,
  });

  const stats = data?.data;

  if (user?.role === 'Student') {
    const exams = examsData?.data || [];
    return (
      <PageWrapper title="My Exams">
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-medium mb-3">Available Exams</h3>
          <ul className="divide-y">
            {exams.map((e) => (
              <li key={e.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-gray-500">Status: {e.status}</div>
                </div>
                <Link href={`/take/${e.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded">Start</Link>
              </li>
            ))}
            {exams.length === 0 && <li className="py-3 text-sm text-gray-500">No exams available.</li>}
          </ul>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Questions" value={stats?.totalQuestions} isLoading={isLoading} />
        <StatCard title="Total Exams" value={stats?.totalExams} isLoading={isLoading} />
        <StatCard title="Total Subjects" value={stats?.totalSubjects} isLoading={isLoading} />
        <StatCard title="Total Users" value={stats?.totalUsers} isLoading={isLoading} />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        <div className="mt-4 bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {isLoading ? (
              <li className="p-4">Loading activity...</li>
            ) : (
              stats?.recentActivity.map((item) => (
                <li key={item.id} className="p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{item.user}</span> {item.action}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
