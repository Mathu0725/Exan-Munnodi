'use client';

import { useQuery } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import { analyticsService } from '@/services/analyticsService';
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: analyticsService.getDashboardStats,
  });

  const stats = data?.data;

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
