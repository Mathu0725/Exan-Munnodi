'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const { requestPasswordReset, authLoading } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const onSubmit = async ({ email }) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const payload = await requestPasswordReset({ email });
      setSuccessMessage(payload?.message || 'If an account exists, reset instructions were sent.');
    } catch (error) {
      setServerError(error?.message || 'Failed to send reset instructions.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your registered email address and we will send reset instructions if it exists.
          </p>
        </div>

        <div className="rounded-lg bg-white px-8 py-10 shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="you@example.com"
              />
            {errors.email && (
              <p id="forgot-email-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
            </div>

            {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {serverError}
            </p>
            )}

            {successMessage && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 whitespace-pre-line" role="status">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
            aria-busy={authLoading}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Need an account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
