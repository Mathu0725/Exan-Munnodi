'use client';

import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-red-600'>Access Denied</h1>
        <p className='mt-4 text-lg text-gray-700'>
          You do not have permission to view this page.
        </p>
        <Link
          href='/'
          className='mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md text-lg font-medium'
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
