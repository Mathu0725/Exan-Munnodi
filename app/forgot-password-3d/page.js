'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CSS3DScene from '@/components/auth/CSS3DScene';
import Fallback3DScene from '@/components/auth/Fallback3DScene';
import EnhancedPasswordResetForm from '@/components/auth/EnhancedPasswordResetForm';
import { FaSpinner } from 'react-icons/fa';

export default function ForgotPassword3DPage() {
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-900 text-white'>
        <FaSpinner className='animate-spin text-4xl mr-2' /> Loading 3D Forgot
        Password...
      </div>
    );
  }

  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* 3D Background */}
      <div className='absolute inset-0 z-0'>
        {useFallback ? <Fallback3DScene /> : <CSS3DScene />}
      </div>

      {/* Overlay */}
      <div className='absolute inset-0 bg-black bg-opacity-40 z-10'></div>

      {/* Content */}
      <div className='relative z-20 flex items-center justify-center min-h-screen p-4'>
        <div className='bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg [-webkit-backdrop-filter:blur(16px)] rounded-xl shadow-2xl p-8 w-full max-w-md border border-white border-opacity-20 animate-fade-in'>
          <EnhancedPasswordResetForm
            mode='request'
            onSuccess={result => {
              console.log('Password reset request successful:', result);
            }}
            onError={error => {
              console.error('Password reset request error:', error);
            }}
            className='text-white'
          />
        </div>
      </div>
    </div>
  );
}
