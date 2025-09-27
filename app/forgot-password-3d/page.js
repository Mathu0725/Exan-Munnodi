'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CSS3DScene from '@/components/auth/CSS3DScene';
import Fallback3DScene from '@/components/auth/Fallback3DScene';
import { FaEnvelope, FaLock, FaGraduationCap, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ForgotPassword3DPage() {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await requestPasswordReset({ email: formData.email });
      setSuccess(response?.message || 'If an account exists, reset instructions were sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <FaSpinner className="animate-spin text-4xl mr-2" /> Loading 3D Forgot Password...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        {useFallback ? <Fallback3DScene /> : <CSS3DScene />}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8 w-full max-w-md border border-white border-opacity-20 animate-fade-in">
          <div className="text-center mb-8">
            <FaGraduationCap className="text-indigo-400 text-6xl mx-auto mb-4 animate-bounce-subtle" />
            <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">Forgot Password?</h2>
            <p className="text-indigo-200 text-lg">No worries, we'll help you reset it!</p>
          </div>

          {success ? (
            <div className="text-center">
              <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-4">Check Your Email!</h3>
              <p className="text-indigo-200 mb-6 text-sm leading-relaxed">
                {success}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login-3d')}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setSuccess('');
                    setFormData({ email: '' });
                  }}
                  className="w-full bg-white bg-opacity-20 text-white py-3 rounded-lg font-semibold text-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300"
                >
                  Try Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-15 rounded-lg border border-white border-opacity-20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                  required
                />
              </div>

              {error && (
                <p className="text-red-300 text-sm text-center bg-red-800 bg-opacity-30 p-2 rounded-md border border-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaLock className="mr-2" />
                )}
                {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-indigo-200">
            <p className="mb-2">
              Remember your password?{' '}
              <button
                onClick={() => router.push('/login-3d')}
                className="text-indigo-300 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
            <p>
              Need an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-indigo-300 hover:underline font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
