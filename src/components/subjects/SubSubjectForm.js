import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export default function SubSubjectForm({ subSubject, subjectId, onSubmit, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: subSubject || { name: '', order: 0 },
  });

  useEffect(() => {
    reset(subSubject || { name: '', order: 0 });
  }, [subSubject, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, subject_id: subjectId });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
          <input
            id="order"
            type="number"
            {...register('order', { valueAsNumber: true })}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
      </div>
    </form>
  );
}
