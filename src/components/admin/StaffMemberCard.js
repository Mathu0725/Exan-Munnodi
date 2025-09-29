'use client';

import {
  FaUserEdit,
  FaUserTimes,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
} from 'react-icons/fa';

export default function StaffMemberCard({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const getStatusColor = status => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRoleColor = role => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Content Editor':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewer':
        return 'bg-orange-100 text-orange-800';
      case 'Analyst':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center'>
            <FaUserEdit className='w-6 h-6 text-indigo-600' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {staff.name}
            </h3>
            <p className='text-sm text-gray-500'>{staff.email}</p>
          </div>
        </div>
        <div className='flex space-x-2'>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              staff.status
            )}`}
          >
            {staff.status}
          </span>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
              staff.role
            )}`}
          >
            {staff.role}
          </span>
        </div>
      </div>

      <div className='space-y-2 text-sm text-gray-600'>
        {staff.phone && (
          <div className='flex items-center'>
            <FaPhone className='w-4 h-4 mr-2' />
            <span>{staff.phone}</span>
          </div>
        )}
        <div className='flex items-center'>
          <FaEnvelope className='w-4 h-4 mr-2' />
          <span>{staff.email}</span>
        </div>
        <div className='flex items-center'>
          <FaCalendarAlt className='w-4 h-4 mr-2' />
          <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className='flex justify-end space-x-2 mt-4'>
        <button
          onClick={() => onToggleStatus(staff)}
          className={`px-3 py-1 text-xs font-medium rounded-md ${
            staff.status === 'Active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {staff.status === 'Active' ? (
            <>
              <FaUserTimes className='mr-1' />
              Deactivate
            </>
          ) : (
            <>
              <FaUserCheck className='mr-1' />
              Activate
            </>
          )}
        </button>
        <button
          onClick={() => onEdit(staff)}
          className='px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200'
        >
          <FaEdit className='mr-1' />
          Edit
        </button>
        <button
          onClick={() => onDelete(staff)}
          className='px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200'
        >
          <FaTrash className='mr-1' />
          Delete
        </button>
      </div>
    </div>
  );
}
