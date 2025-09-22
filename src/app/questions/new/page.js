import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PageWrapper from '@/components/layout/PageWrapper';
import { questionService } from '@/services/questionService';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';
import OptionsEditor from '@/components/questions/OptionsEditor';
import DifficultySelector from '@/components/questions/DifficultySelector';
import ImageUploader from '@/components/questions/ImageUploader';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

export default function NewQuestionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submissionStatus, setSubmissionStatus] = useState('draft');

  const { control, register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      body: '',
      image_url: null,
      subject_id: '',
      sub_subject_id: '',
      category_id: '',
      difficulty: 1,
      marks: 1,
      negative_marks: 0,
      time_limit: '',
      status: 'draft',
      options: [],
      answer_key: '',
    },
  });

  const selectedSubject = watch('subject_id');

  const { data: subjectsData } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectService.getSubjects({ limit: 100 }) });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
  const { data: subSubjectsData, isLoading: isLoadingSubSubjects } = useQuery({
    queryKey: ['subsubjects', selectedSubject],
    queryFn: () => subjectService.getSubSubjectsForSubject(selectedSubject),
    enabled: !!selectedSubject,
  });

  useEffect(() => {
    setValue('sub_subject_id', '');
  }, [selectedSubject, setValue]);

  const createMutation = useMutation({
    mutationFn: questionService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      router.push('/questions');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      status: submissionStatus,
      subject_id: parseInt(data.subject_id),
      sub_subject_id: data.sub_subject_id ? parseInt(data.sub_subject_id) : null,
      category_id: parseInt(data.category_id),
      time_limit: data.time_limit ? parseInt(data.time_limit, 10) : null,
      options: data.options.map(opt => ({...opt, is_correct: opt.id === data.answer_key}))
    };
    createMutation.mutate(payload);
  };

  return (
    <PageWrapper title="Create New Question">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input {...register('title')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Question Body</label>
          <Controller
            name="body"
            control={control}
            render={({ field }) => <QuillEditor theme="snow" {...field} className="mt-1 bg-white" />}
          />
        </div>

        <ImageUploader onUploadComplete={(url) => setValue('image_url', url)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select {...register('subject_id')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select Subject</option>
            {subjectsData?.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select {...register('sub_subject_id')} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={!selectedSubject || isLoadingSubSubjects}>
            <option value="">Select Sub-subject</option>
            {subSubjectsData?.data.map((ss) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
          </select>
          <select {...register('category_id')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select Category</option>
            {categoriesData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <OptionsEditor control={control} register={register} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => <DifficultySelector {...field} />}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Marks</label>
            <input type="number" {...register('marks', { valueAsNumber: true })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Negative Marks</label>
            <input type="number" {...register('negative_marks', { valueAsNumber: true })} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Limit (s)</label>
            <input type="number" placeholder="Optional" {...register('time_limit')} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button 
            type="submit" 
            onClick={() => setSubmissionStatus('draft')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-400"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && submissionStatus === 'draft' ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            type="submit" 
            onClick={() => setSubmissionStatus('published')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && submissionStatus === 'published' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}
