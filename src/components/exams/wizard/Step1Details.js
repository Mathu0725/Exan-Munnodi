import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { examTypeService } from '@/services/masterDataService';

export default function Step1Details({ data, onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: data.title,
      description: data.description,
      examTypeId: data.examTypeId,
      startAt: data.startAt,
      endAt: data.endAt,
    },
  });
  const { data: examTypesData } = useQuery({ queryKey: ['examTypes'], queryFn: () => examTypeService.getAll() });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 mt-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">Exam Title</label>
        <input {...register('title', { required: 'Title is required' })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} rows={3} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>

          <select {...register('examTypeId', { required: 'Exam type is required' })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md">
            <option value="">Select Type</option>
            {examTypesData?.data.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
          </select>
          {errors.examTypeId && <p className="text-red-500 text-sm mt-1">{errors.examTypeId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="datetime-local" {...register('startAt')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="datetime-local" {...register('endAt')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Next</button>
      </div>
    </form>
  );
}
