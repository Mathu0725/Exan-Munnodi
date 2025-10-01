'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { FaUserPlus, FaSave, FaTimes } from 'react-icons/fa';

const StaffCreationForm = ({ onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin',
    institution: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const createStaffMutation = useMutation({
    mutationFn: async staffData => {
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create staff member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      onClose();
      alert('Staff member created successfully!');
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...staffData } = formData;
      createStaffMutation.mutate(staffData);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <ProtectedRoute requiredRole='ADMIN'>
      <PageWrapper title='Create Staff Member'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                <FaUserPlus className='mr-2' />
                Create New Staff Member
              </h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600'
              >
                <FaTimes className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Full Name *
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='Enter full name'
                  />
                  {errors.name && (
                    <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Email Address *
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='Enter email address'
                  />
                  {errors.email && (
                    <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='role'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Role *
                  </label>
                  <select
                    id='role'
                    name='role'
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Select Role</option>
                    <option value='Admin'>Admin</option>
                    <option value='Content Editor'>Content Editor</option>
                    <option value='Reviewer'>Reviewer</option>
                    <option value='Analyst'>Analyst</option>
                  </select>
                  {errors.role && (
                    <p className='text-red-500 text-sm mt-1'>{errors.role}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='institution'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Institution
                  </label>
                  <input
                    type='text'
                    id='institution'
                    name='institution'
                    value={formData.institution}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    placeholder='Enter institution name'
                  />
                </div>

                <div>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    placeholder='Enter phone number'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Password *
                  </label>
                  <input
                    type='password'
                    id='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='Enter password'
                  />
                  {errors.password && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Confirm Password *
                  </label>
                  <input
                    type='password'
                    id='confirmPassword'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmPassword
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder='Confirm password'
                  />
                  {errors.confirmPassword && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
                <h4 className='text-sm font-medium text-blue-800 mb-2'>
                  Role Permissions:
                </h4>
                <div className='text-sm text-blue-700 space-y-1'>
                  <p>
                    <strong>Admin:</strong> Full system access, user management,
                    all features
                  </p>
                  <p>
                    <strong>Content Editor:</strong> Question bank, exams,
                    student groups
                  </p>
                  <p>
                    <strong>Reviewer:</strong> View and review content, limited
                    editing
                  </p>
                  <p>
                    <strong>Analyst:</strong> View reports and analytics,
                    read-only access
                  </p>
                </div>
              </div>

              <div className='flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={createStaffMutation.isPending}
                  className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center'
                >
                  <FaSave className='mr-2' />
                  {createStaffMutation.isPending
                    ? 'Creating...'
                    : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
};

export default StaffCreationForm;
