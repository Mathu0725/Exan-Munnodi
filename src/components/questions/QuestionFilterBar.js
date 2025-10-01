'use client';

import { useQuery } from '@tanstack/react-query';
import { subjectService } from '@/services/subjectService';
import { categoryService } from '@/services/masterDataService';

export default function QuestionFilterBar({ filters, onFilterChange }) {
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects({ limit: 100 }), // Fetch all for dropdown
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });
  const { data: subSubjectsData } = useQuery({
    queryKey: ['subsubjects', filters.subject_id],
    queryFn: () => subjectService.getSubSubjectsForSubject(filters.subject_id),
    enabled: !!filters.subject_id,
  });

  const handleFilterChange = e => {
    const { name, value } = e.target;
    if (name === 'subject_id') {
      // Reset sub-subject when subject changes to prevent stale filters
      onFilterChange('sub_subject_id', '');
    }
    onFilterChange(name, value);
  };

  return (
    <div className='p-4 bg-white rounded-lg shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-4'>
      <input
        type='text'
        name='search'
        placeholder='Search questions...'
        value={filters.search || ''}
        onChange={handleFilterChange}
        className='w-full px-3 py-2 border border-gray-300 rounded-md'
      />
      <select
        name='subject_id'
        value={filters.subject_id || ''}
        onChange={handleFilterChange}
        className='w-full px-3 py-2 border border-gray-300 rounded-md'
      >
        <option value=''>All Subjects</option>
        {subjectsData?.data.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <select
        name='sub_subject_id'
        value={filters.sub_subject_id || ''}
        onChange={handleFilterChange}
        disabled={!filters.subject_id}
        className='w-full px-3 py-2 border border-gray-300 rounded-md'
      >
        <option value=''>
          {filters.subject_id ? 'All Sub-subjects' : 'Select Subject First'}
        </option>
        {subSubjectsData?.data.map(ss => (
          <option key={ss.id} value={ss.id}>
            {ss.name}
          </option>
        ))}
      </select>
      <select
        name='category_id'
        value={filters.category_id || ''}
        onChange={handleFilterChange}
        className='w-full px-3 py-2 border border-gray-300 rounded-md'
      >
        <option value=''>All Categories</option>
        {categoriesData?.data.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        name='difficulty'
        value={filters.difficulty || ''}
        onChange={handleFilterChange}
        className='w-full px-3 py-2 border border-gray-300 rounded-md'
      >
        <option value=''>All Difficulties</option>
        {[1, 2, 3, 4, 5].map(d => (
          <option key={d} value={d}>
            Difficulty {d}
          </option>
        ))}
      </select>
    </div>
  );
}
