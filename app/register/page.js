'use client';

import Link from 'next/link';
import EnhancedRegisterForm from '@/components/auth/EnhancedRegisterForm';

export default function RegisterPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-2xl rounded-lg bg-white px-10 py-12 shadow'>
        <EnhancedRegisterForm
          onSuccess={result => {
            console.log('Registration successful:', result);
          }}
          onError={error => {
            console.error('Registration error:', error);
          }}
          showLogin={true}
        />
      </div>
    </div>
  );
}
