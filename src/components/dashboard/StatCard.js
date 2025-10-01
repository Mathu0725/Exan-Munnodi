'use client';

export default function StatCard({ title, value, isLoading }) {
  return (
    <div className='relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gunmetal-700 dark:bg-gunmetal-900'>
      <div className='flex flex-col gap-2'>
        <h4 className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gunmetal-300'>
          {title}
        </h4>
        {isLoading ? (
          <div className='h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gunmetal-700'></div>
        ) : (
          <p className='text-3xl font-semibold text-gray-900 dark:text-midnight-50'>
            {value ?? '—'}
          </p>
        )}
      </div>
    </div>
  );
}
