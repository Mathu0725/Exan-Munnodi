'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export default function SubjectForm({ subject, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: subject || { name: '', order: 0, active: true },
  });

  useEffect(() => {
    reset(subject || { name: '', order: 0, active: true });
  }, [subject, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Name
          </label>
          <input
            id='name'
            {...register('name', { required: 'Name is required' })}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor='order'
            className='block text-sm font-medium text-gray-700'
          >
            Order
          </label>
          <input
            id='order'
            type='number'
            {...register('order', { valueAsNumber: true })}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
          />
        </div>
        <div className='flex items-center'>
          <input
            id='active'
            type='checkbox'
            {...register('active')}
            className='h-4 w-4 text-indigo-600 border-gray-300 rounded'
          />
          <label htmlFor='active' className='ml-2 block text-sm text-gray-900'>
            Active
          </label>
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
