'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaCalendarAlt, FaClock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const ExamScheduler = ({ exam, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startAt: exam.startAt ? new Date(exam.startAt).toISOString().slice(0, 16) : '',
    endAt: exam.endAt ? new Date(exam.endAt).toISOString().slice(0, 16) : '',
    isScheduled: exam.isScheduled || false,
    rescheduleReason: exam.rescheduleReason || '',
  });

  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/exams/${exam.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to schedule exam');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setIsEditing(false);
      onClose();
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/exams/${exam.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to reschedule exam');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setIsEditing(false);
      onClose();
    },
  });

  const handleSave = () => {
    if (exam.isScheduled) {
      rescheduleMutation.mutate(scheduleData);
    } else {
      scheduleMutation.mutate(scheduleData);
    }
  };

  const handleCancel = () => {
    setScheduleData({
      startAt: exam.startAt ? new Date(exam.startAt).toISOString().slice(0, 16) : '',
      endAt: exam.endAt ? new Date(exam.endAt).toISOString().slice(0, 16) : '',
      isScheduled: exam.isScheduled || false,
      rescheduleReason: exam.rescheduleReason || '',
    });
    setIsEditing(false);
  };

  const getStatusColor = () => {
    if (!exam.isScheduled) return 'bg-gray-100 text-gray-800';
    if (new Date(exam.startAt) > new Date()) return 'bg-blue-100 text-blue-800';
    if (new Date(exam.endAt) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!exam.isScheduled) return 'Not Scheduled';
    if (new Date(exam.startAt) > new Date()) return 'Scheduled';
    if (new Date(exam.endAt) < new Date()) return 'Completed';
    return 'In Progress';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaCalendarAlt className="mr-2" />
          Exam Scheduling
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Current Status</h4>
            <p className="text-sm text-gray-600">
              {exam.isScheduled ? 'Scheduled' : 'Not Scheduled'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Schedule Information */}
        {exam.isScheduled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <p className="text-sm text-gray-900">
                {exam.startAt ? new Date(exam.startAt).toLocaleString() : 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <p className="text-sm text-gray-900">
                {exam.endAt ? new Date(exam.endAt).toLocaleString() : 'Not set'}
              </p>
            </div>
            {exam.scheduledAt && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Originally Scheduled</label>
                <p className="text-sm text-gray-900">
                  {new Date(exam.scheduledAt).toLocaleString()}
                </p>
              </div>
            )}
            {exam.rescheduledAt && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Rescheduled</label>
                <p className="text-sm text-gray-900">
                  {new Date(exam.rescheduledAt).toLocaleString()}
                </p>
                {exam.rescheduleReason && (
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {exam.rescheduleReason}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleData.startAt}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, startAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleData.endAt}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, endAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {exam.isScheduled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reschedule Reason</label>
                <textarea
                  value={scheduleData.rescheduleReason}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, rescheduleReason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Reason for rescheduling (optional)"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={scheduleMutation.isPending || rescheduleMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {scheduleMutation.isPending || rescheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 flex items-center"
            >
              <FaEdit className="mr-2" />
              {exam.isScheduled ? 'Reschedule' : 'Schedule'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamScheduler;
