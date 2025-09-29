'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { USER_ROLES, USER_STATUSES } from '@/constants/users';

export default function UserForm({ user, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: user || {
      name: '',
      email: '',
      role: 'Student',
      status: 'Pending',
      password: '',
      phone: '',
      institution: '',
    },
  });

  useEffect(() => {
    reset(
      user || {
        name: '',
        email: '',
        role: 'Student',
        status: 'Pending',
        password: '',
        phone: '',
        institution: '',
      }
    );
  }, [user, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Name
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Email
          </label>
          <input
            type='email'
            {...register('email', { required: 'Email is required' })}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            disabled={!!user}
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
          )}
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Role
            </label>
            <select
              {...register('role')}
              className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            >
              {USER_ROLES.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <select
              {...register('status')}
              className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            >
              {USER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!user && (
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Temporary Password
            </label>
            <input
              type='password'
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            />
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>
        )}
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Phone number
          </label>
          <input
            type='tel'
            {...register('phone')}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            placeholder='Optional'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Institution / Organization
          </label>
          <input
            type='text'
            {...register('institution')}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
            placeholder='Optional'
          />
        </div>
      </div>
      <div className='mt-6 flex justify-end space-x-3'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 bg-gray-200 rounded-md'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-4 py-2 bg-indigo-600 text-white rounded-md'
        >
          Save
        </button>
      </div>
    </form>
  );
}
