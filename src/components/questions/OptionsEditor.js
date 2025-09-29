'use client';

import { useFieldArray } from 'react-hook-form';

export default function OptionsEditor({ control, register }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  return (
    <div className='space-y-4'>
      <label className='block text-sm font-medium text-gray-700'>Options</label>
      {fields.map((item, index) => (
        <div key={item.id} className='flex items-center space-x-2'>
          <input
            {...register(`options.${index}.text`)}
            placeholder={`Option ${index + 1}`}
            className='w-full px-3 py-2 border border-gray-300 rounded-md'
          />
          <div className='flex items-center'>
            <input
              type='radio'
              {...register('answer_key')}
              value={item.id}
              id={`correct_option_${index}`}
              className='h-4 w-4 text-indigo-600 border-gray-300'
            />
            <label htmlFor={`correct_option_${index}`} className='ml-2 text-sm'>
              Correct
            </label>
          </div>
          <button
            type='button'
            onClick={() => remove(index)}
            className='text-red-500 hover:text-red-700'
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={() =>
          append({ id: `option-${Date.now()}`, text: '', is_correct: false })
        }
        className='px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300'
      >
        + Add Option
      </button>
    </div>
  );
}
