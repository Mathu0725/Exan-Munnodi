import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { ROLES } from '@/services/userService';

export default function UserForm({ user, onSubmit, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: user || { name: '', email: '', role: 'Content Editor' },
  });

  useEffect(() => {
    reset(user || { name: '', email: '', role: 'Content Editor' });
  }, [user, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select {...register('role')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
      </div>
    </form>
  );
}
