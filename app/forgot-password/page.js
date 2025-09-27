'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to 3D forgot password page
    router.replace('/forgot-password-3d');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className="text-center text-white">
        <FaSpinner className="animate-spin text-4xl mx-auto mb-4" />
        <p className="text-lg">Redirecting to 3D Forgot Password...</p>
      </div>
    </div>
  );
}
