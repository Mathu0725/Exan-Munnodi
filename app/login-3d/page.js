'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CSS3DScene from '@/components/auth/CSS3DScene';
import Fallback3DScene from '@/components/auth/Fallback3DScene';
import EnhancedLoginForm from '@/components/auth/EnhancedLoginForm';
import { FaSpinner } from 'react-icons/fa';

export default function Login3DPage() {
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-center'>
          <FaSpinner className='animate-spin text-4xl mx-auto mb-4' />
          <p>Loading...</p>
        </div>
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
      <div className='relative z-20 min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          {/* Login Card */}
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8'>
            <EnhancedLoginForm
              onSuccess={result => {
                console.log('Login successful:', result);
              }}
              onError={error => {
                console.error('Login error:', error);
              }}
              showForgotPassword={true}
              showRegister={true}
            />
          </div>

          {/* Additional Info */}
          <div className='mt-8 text-center'>
            <div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10'>
              <h3 className='text-white font-semibold mb-2'>System Features</h3>
              <div className='grid grid-cols-2 gap-2 text-xs text-white/70'>
                <div className='flex items-center justify-center'>
                  <span className='w-2 h-2 bg-green-400 rounded-full mr-2'></span>
                  Real-time Exams
                </div>
                <div className='flex items-center justify-center'>
                  <span className='w-2 h-2 bg-blue-400 rounded-full mr-2'></span>
                  Student Groups
                </div>
                <div className='flex items-center justify-center'>
                  <span className='w-2 h-2 bg-purple-400 rounded-full mr-2'></span>
                  Analytics
                </div>
                <div className='flex items-center justify-center'>
                  <span className='w-2 h-2 bg-yellow-400 rounded-full mr-2'></span>
                  Notifications
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className='absolute top-10 left-10 z-30'>
        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
          <h4 className='text-white font-semibold text-sm mb-2'>Quick Stats</h4>
          <div className='space-y-1 text-xs text-white/80'>
            <p>Active Users: 1,250+</p>
            <p>Exams Created: 500+</p>
            <p>Success Rate: 98%</p>
          </div>
        </div>
      </div>

      <div className='absolute top-10 right-10 z-30'>
        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
          <h4 className='text-white font-semibold text-sm mb-2'>
            System Status
          </h4>
          <div className='space-y-1 text-xs text-white/80'>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-green-400 rounded-full mr-2'></span>
              All Systems Online
            </div>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-blue-400 rounded-full mr-2'></span>
              Database Connected
            </div>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-purple-400 rounded-full mr-2'></span>
              3D Engine Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
