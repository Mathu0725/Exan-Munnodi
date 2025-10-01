'use client';

import Link from 'next/link';
import { FaUserPlus, FaUsers, FaEye } from 'react-icons/fa';

export default function GroupCard({ group, onEdit, onDelete, onAddStudents }) {
  const memberCount = group._count?.members || 0;
  const examCount = group._count?.examGroups || 0;

  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div
            className='w-4 h-4 rounded-full'
            style={{ backgroundColor: group.color || '#3B82F6' }}
          />
          <h3 className='text-lg font-semibold text-gray-900'>{group.name}</h3>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => onAddStudents(group)}
            className='text-green-600 hover:text-green-900 text-sm font-medium flex items-center'
          >
            <FaUserPlus className='mr-1' />
            Add Students
          </button>
          <button
            onClick={() => onEdit(group)}
            className='text-indigo-600 hover:text-indigo-900 text-sm font-medium'
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(group)}
            className='text-red-600 hover:text-red-900 text-sm font-medium'
          >
            Delete
          </button>
        </div>
      </div>

      {group.description && (
        <p className='text-gray-600 text-sm mb-4'>{group.description}</p>
      )}

      <div className='flex items-center justify-between text-sm text-gray-500'>
        <div className='flex space-x-4'>
          <span>👥 {memberCount} members</span>
          <span>📝 {examCount} exams</span>
        </div>
        <span className='text-xs'>
          Created {new Date(group.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
