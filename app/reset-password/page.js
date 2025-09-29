'use client';

import EnhancedPasswordResetForm from '@/components/auth/EnhancedPasswordResetForm';

export default function ResetPasswordPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md rounded-lg bg-white px-8 py-12 shadow'>
        <EnhancedPasswordResetForm
          mode='reset'
          onSuccess={result => {
            console.log('Password reset successful:', result);
          }}
          onError={error => {
            console.error('Password reset error:', error);
          }}
        />
      </div>
    </div>
  );
}
