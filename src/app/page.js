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
        <div className="bg-white dark:bg-gunmetal-900 rounded-lg shadow-sm border border-gray-200 dark:border-gunmetal-700">
          <div className="px-4 py-5 sm:px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-midnight-50">Available Exams</h3>
              <p className="text-sm text-gray-500 dark:text-gunmetal-200">Start a new exam or resume an active attempt.</p>
            </div>
            <span className="hidden text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gunmetal-300 sm:block">
              {exams.length} exam{exams.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gunmetal-700">
            <ul className="divide-y divide-gray-200 dark:divide-gunmetal-700">
              {exams.map((e) => (
                <li key={e.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-medium text-gray-900 dark:text-midnight-50">{e.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gunmetal-200">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gunmetal-800">
                          Status: <span className="ml-1 font-medium capitalize">{e.status}</span>
                        </span>
                        {e.duration && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gunmetal-800">
                            Duration: <span className="ml-1 font-medium">{e.duration} min</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Link
                        href={`/take/${e.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gunmetal-900"
                      >
                        Start
                      </Link>
                      <Link
                        href={`/exams/${e.id}/preview`}
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gunmetal-700 dark:text-midnight-100 dark:hover:bg-gunmetal-800 dark:focus:ring-offset-gunmetal-900"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
              {exams.length === 0 && (
                <li className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gunmetal-200">
                  No exams available at the moment. Check back later.
                </li>
              )}
            </ul>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Dashboard">
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Questions" value={stats?.totalQuestions} isLoading={isLoading} />
          <StatCard title="Total Exams" value={stats?.totalExams} isLoading={isLoading} />
          <StatCard title="Total Subjects" value={stats?.totalSubjects} isLoading={isLoading} />
          <StatCard title="Total Users" value={stats?.totalUsers} isLoading={isLoading} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-midnight-50">Recent Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gunmetal-200">Track important updates across the platform.</p>
          </div>
          <Link
            href="/audit-logs"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gunmetal-700 dark:text-midnight-100 dark:hover:bg-gunmetal-800"
          >
            View all activity
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gunmetal-700 dark:bg-gunmetal-900">
          <ul className="divide-y divide-gray-200 dark:divide-gunmetal-700">
            {isLoading ? (
              <li className="p-6 text-sm text-gray-500 dark:text-gunmetal-200">Loading activity...</li>
            ) : stats?.recentActivity?.length ? (
              stats.recentActivity.map((item) => (
                <li key={item.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600 dark:text-gunmetal-100">
                      <span className="font-medium text-gray-900 dark:text-midnight-50">{item.user}</span> {item.action}
                    </p>
                    {item.timestamp && (
                      <span className="text-xs text-gray-400 dark:text-gunmetal-300">{item.timestamp}</span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-sm text-gray-500 dark:text-gunmetal-200">No recent activity recorded.</li>
            )}
          </ul>
        </div>
      </section>
    </PageWrapper>
  );
}
