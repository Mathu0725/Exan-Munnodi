'use client';

import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { examTypeService } from '@/services/masterDataService';
import { useState } from 'react';

export default function Step1Details({ data, onNext }) {
  const [selectedGroups, setSelectedGroups] = useState(data.groupIds || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: data.title,
      description: data.description,
      examTypeId: data.examTypeId,
      startAt: data.startAt,
      endAt: data.endAt,
    },
  });

  const { data: examTypesData } = useQuery({
    queryKey: ['examTypes'],
    queryFn: () => examTypeService.getAll(),
  });
  const { data: groupsData } = useQuery({
    queryKey: ['student-groups-list'],
    queryFn: () => fetch('/api/student-groups/list').then(res => res.json()),
  });

  const handleGroupToggle = groupId => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleFormSubmit = formData => {
    onNext({ ...formData, groupIds: selectedGroups });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6 mt-8'>
      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Exam Title
        </label>
        <input
          {...register('title', { required: 'Title is required' })}
          className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
        />
        {errors.title && (
          <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Exam Type
          </label>
          <select
            {...register('examTypeId', { required: 'Exam type is required' })}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          >
            <option value=''>Select Type</option>
            {examTypesData?.data.map(et => (
              <option key={et.id} value={et.id}>
                {et.name}
              </option>
            ))}
          </select>
          {errors.examTypeId && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.examTypeId.message}
            </p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Start Date
          </label>
          <input
            type='datetime-local'
            {...register('startAt')}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            End Date
          </label>
          <input
            type='datetime-local'
            {...register('endAt')}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          />
        </div>
      </div>

      {/* Student Groups Selection */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Assign to Student Groups
        </label>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {groupsData?.map(group => (
            <div
              key={group.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedGroups.includes(group.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleGroupToggle(group.id)}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: group.color }}
                />
                <div className='flex-1'>
                  <h4 className='font-medium text-gray-900'>{group.name}</h4>
                  <p className='text-sm text-gray-500'>
                    {group._count.members} members
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => handleGroupToggle(group.id)}
                  className='h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
                />
              </div>
            </div>
          ))}
        </div>
        {selectedGroups.length > 0 && (
          <p className='mt-2 text-sm text-gray-600'>
            📢 {selectedGroups.length} group(s) selected - Students will receive
            notifications
          </p>
        )}
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          className='px-6 py-2 bg-indigo-600 text-white rounded-md'
        >
          Next
        </button>
      </div>
    </form>
  );
}
