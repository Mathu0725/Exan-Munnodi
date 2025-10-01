'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import {
  FaDownload,
  FaFilter,
  FaChartBar,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
} from 'react-icons/fa';

const ReportFilters = ({ filters, onFilterChange, exams = [], onExport }) => {
  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <FaFilter className='mr-2' />
        Report Filters
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Exam
          </label>
          <select
            value={filters.examId || ''}
            onChange={e => onFilterChange('examId', e.target.value || null)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>All Exams</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Date Range
          </label>
          <div className='flex space-x-2'>
            <input
              type='date'
              value={filters.startDate || ''}
              onChange={e => onFilterChange('startDate', e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Start Date'
            />
            <input
              type='date'
              value={filters.endDate || ''}
              onChange={e => onFilterChange('endDate', e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='End Date'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Score Range
          </label>
          <div className='flex space-x-2'>
            <input
              type='number'
              min='0'
              max='100'
              value={filters.minScore || ''}
              onChange={e =>
                onFilterChange(
                  'minScore',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Min %'
            />
            <input
              type='number'
              min='0'
              max='100'
              value={filters.maxScore || ''}
              onChange={e =>
                onFilterChange(
                  'maxScore',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Max %'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={e => onFilterChange('status', e.target.value || null)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>All Status</option>
            <option value='completed'>Completed</option>
            <option value='in_progress'>In Progress</option>
            <option value='abandoned'>Abandoned</option>
          </select>
        </div>
      </div>

      <div className='flex justify-end mt-4 space-x-2'>
        <button
          onClick={() => onFilterChange('reset')}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
        >
          Clear Filters
        </button>
        <button
          onClick={onExport}
          className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center'
        >
          <FaDownload className='mr-2' />
          Export Report
        </button>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
      <div className='flex items-center'>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className='h-6 w-6' />
        </div>
        <div className='ml-4'>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-semibold text-gray-900'>{value}</p>
          {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const ExamResultRow = ({ result }) => {
  const percentage = (result.score / result.totalMarks) * 100;
  const getScoreColor = percentage => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <tr className='hover:bg-gray-50'>
      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
        {result.user?.name || 'Unknown User'}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
        {result.exam?.title || 'Unknown Exam'}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
        {result.submittedAt
          ? new Date(result.submittedAt).toLocaleDateString()
          : 'Not submitted'}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
        {result.score} / {result.totalMarks}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getScoreColor(percentage)}`}
      >
        {percentage.toFixed(1)}%
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            result.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : result.status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {result.status || 'Unknown'}
        </span>
      </td>
    </tr>
  );
};

export default function ExamReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({
    examId: null,
    startDate: null,
    endDate: null,
    minScore: null,
    maxScore: null,
    status: null,
  });

  const { data: examResults, isLoading } = useQuery({
    queryKey: ['exam-reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const res = await fetch(`/api/admin/exam-reports?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load exam reports');
      return res.json();
    },
  });

  const { data: examsData } = useQuery({
    queryKey: ['exams-for-reports'],
    queryFn: async () => {
      const res = await fetch('/api/exams');
      if (!res.ok) throw new Error('Failed to load exams');
      return res.json();
    },
  });

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        examId: null,
        startDate: null,
        endDate: null,
        minScore: null,
        maxScore: null,
        status: null,
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const exportUrl = `/api/admin/exam-reports/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  const results = examResults?.data || [];
  const exams = examsData?.data || [];

  // Calculate statistics
  const totalResults = results.length;
  const completedResults = results.filter(r => r.status === 'completed').length;
  const averageScore =
    totalResults > 0
      ? results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) /
        totalResults
      : 0;
  const passRate =
    totalResults > 0
      ? (results.filter(r => (r.score / r.totalMarks) * 100 >= 60).length /
          totalResults) *
        100
      : 0;

  if (!user || !['Admin', 'Content Editor'].includes(user.role)) {
    return (
      <PageWrapper title='Access Denied'>
        <div className='text-center py-12'>
          <p className='text-red-500'>
            Access denied. Admin privileges required.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title='Exam Reports'>
      <div className='space-y-6'>
        {/* Breadcrumb Navigation */}
        <div className='mb-6'>
          <nav className='flex items-center space-x-2 text-sm text-gray-500 mb-4'>
            <button
              onClick={() => router.push('/')}
              className='hover:text-indigo-600 transition-colors'
            >
              Dashboard
            </button>
            <span>/</span>
            <span className='text-gray-900 font-medium'>Exam Reports</span>
          </nav>
        </div>
        {/* Filters */}
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          exams={exams}
          onExport={handleExport}
        />

        {/* Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <StatsCard
            title='Total Attempts'
            value={totalResults}
            icon={FaChartBar}
            color='blue'
          />
          <StatsCard
            title='Completed'
            value={completedResults}
            icon={FaGraduationCap}
            color='green'
            subtitle={`${totalResults > 0 ? ((completedResults / totalResults) * 100).toFixed(1) : 0}% completion rate`}
          />
          <StatsCard
            title='Average Score'
            value={`${averageScore.toFixed(1)}%`}
            icon={FaChartBar}
            color='yellow'
          />
          <StatsCard
            title='Pass Rate'
            value={`${passRate.toFixed(1)}%`}
            icon={FaUsers}
            color='purple'
          />
        </div>

        {/* Results Table */}
        <div className='bg-white rounded-lg shadow-md border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Exam Results
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='text-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto'></div>
                <p className='mt-2 text-gray-500'>Loading exam results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className='text-center py-12'>
                <FaChartBar className='text-4xl text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No exam results found.</p>
                <p className='text-sm text-gray-400 mt-1'>
                  Try adjusting your filters.
                </p>
              </div>
            ) : (
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Student
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Exam
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Score
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Percentage
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {results.map(result => (
                    <ExamResultRow key={result.id} result={result} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
