'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserShield, FaTimes } from 'react-icons/fa';

const QuickAdminCreation = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    institution: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const createAdminMutation = useMutation({
    mutationFn: async adminData => {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create admin');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-staff']);
      onClose();
      alert('Admin/Staff member created successfully!');
    },
    onError: error => {
      alert(`Error: ${error.message}`);
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      createAdminMutation.mutate(formData);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full mx-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <FaUserShield className='mr-2' />
            Quick Create Admin/Staff
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <FaTimes className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name *
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter full name'
            />
            {errors.name && (
              <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email *
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter email address'
            />
            {errors.email && (
              <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Password *
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter password'
            />
            {errors.password && (
              <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Role *
            </label>
            <select
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value='Admin'>Admin</option>
              <option value='Content Editor'>Content Editor</option>
              <option value='Reviewer'>Reviewer</option>
              <option value='Analyst'>Analyst</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Institution
            </label>
            <input
              type='text'
              name='institution'
              value={formData.institution}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Enter institution name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Enter phone number'
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={createAdminMutation.isPending}
              className='px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50'
            >
              {createAdminMutation.isPending
                ? 'Creating...'
                : 'Create Admin/Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAdminCreation;
