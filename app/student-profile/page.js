'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import { FaUser, FaGraduationCap, FaChartLine, FaCalendarAlt, FaTrophy, FaClock } from 'react-icons/fa';

const ExamResultCard = ({ result }) => {
  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGrade = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.exam?.title || 'Unknown Exam'}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <FaCalendarAlt className="inline mr-1" />
            {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Not submitted'}
          </p>
          {result.exam?.duration && (
            <p className="text-sm text-gray-500">
              <FaClock className="inline mr-1" />
              Duration: {result.exam.duration} minutes
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score, result.totalMarks)}`}>
          {getGrade(result.score, result.totalMarks)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{result.score}</div>
          <div className="text-sm text-gray-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{result.totalMarks}</div>
          <div className="text-sm text-gray-500">Total Marks</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full ${
            (result.score / result.totalMarks) * 100 >= 80 ? 'bg-green-500' :
            (result.score / result.totalMarks) * 100 >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${(result.score / result.totalMarks) * 100}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Percentage: {((result.score / result.totalMarks) * 100).toFixed(1)}%</span>
        <span>Status: {result.status || 'Completed'}</span>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, recent, passed, failed

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/profile?id=${user?.id}`);
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: examResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['student-exam-results', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/exam-results/student/${user?.id}`);
      if (!res.ok) throw new Error('Failed to load exam results');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const profile = profileData?.data?.user;
  const results = examResults?.data || [];

  // Calculate statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => (r.score / r.totalMarks) * 100 >= 60).length;
  const averageScore = totalExams > 0 ? results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / totalExams : 0;
  const highestScore = totalExams > 0 ? Math.max(...results.map(r => (r.score / r.totalMarks) * 100)) : 0;

  // Filter results
  const filteredResults = results.filter(result => {
    const percentage = (result.score / result.totalMarks) * 100;
    switch (filter) {
      case 'recent':
        return new Date(result.submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      case 'passed':
        return percentage >= 60;
      case 'failed':
        return percentage < 60;
      default:
        return true;
    }
  });

  if (!user) {
    return (
      <PageWrapper title="Student Profile">
        <div className="text-center py-12">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </PageWrapper>
    );
  }

  if (user.role !== 'Student') {
    return (
      <PageWrapper title="Access Denied">
        <div className="text-center py-12">
          <p className="text-red-500">This page is only accessible to students.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Profile & Exam Results">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <FaUser className="text-3xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Unknown User'}</h1>
              <p className="text-gray-600 mb-2">{profile?.email}</p>
              {profile?.institution && (
                <p className="text-sm text-gray-500 flex items-center">
                  <FaGraduationCap className="mr-2" />
                  {profile.institution}
                </p>
              )}
              {profile?.phone && (
                <p className="text-sm text-gray-500">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Exams"
            value={totalExams}
            icon={FaChartLine}
            color="blue"
          />
          <StatsCard
            title="Passed Exams"
            value={passedExams}
            icon={FaTrophy}
            color="green"
          />
          <StatsCard
            title="Average Score"
            value={`${averageScore.toFixed(1)}%`}
            icon={FaChartLine}
            color="yellow"
          />
          <StatsCard
            title="Highest Score"
            value={`${highestScore.toFixed(1)}%`}
            icon={FaTrophy}
            color="purple"
          />
        </div>

        {/* Exam Results Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Exam Results</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'all' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'recent' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setFilter('passed')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'passed' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Passed
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'failed' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Failed
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {resultsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading exam results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exam results found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === 'all' ? 'You haven\'t taken any exams yet.' : `No ${filter} exam results found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((result) => (
                  <ExamResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
