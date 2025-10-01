'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export default function MasterDataForm({ item, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: item || { name: '', description: '' },
  });

  useEffect(() => {
    reset(item || { name: '', description: '' });
  }, [item, reset]);

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
            htmlFor='description'
            className='block text-sm font-medium text-gray-700'
          >
            Description
          </label>
          <textarea
            id='description'
            {...register('description')}
            rows={3}
            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md'
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
