'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function ResetWithOtpPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const password = watch('password');

  const onSubmit = async ({ email, otp, password }) => {
    setServerError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(payload?.message || 'Failed to reset password');
      setSuccessMessage(
        payload?.message || 'Password updated successfully. You can now log in.'
      );
    } catch (err) {
      setServerError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Reset password with OTP
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Enter the one-time code sent to your email and choose a new
            password.
          </p>
        </div>

        <div className='rounded-lg bg-white px-8 py-10 shadow'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email address
              </label>
              <input
                id='email'
                type='email'
                autoComplete='email'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                placeholder='you@example.com'
              />
              {errors.email && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='otp'
                className='block text-sm font-medium text-gray-700'
              >
                One-time code (OTP)
              </label>
              <input
                id='otp'
                type='text'
                inputMode='numeric'
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Enter the 6-digit code',
                  },
                })}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                placeholder='123456'
              />
              {errors.otp && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.otp.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                New password
              </label>
              <input
                id='password'
                type='password'
                autoComplete='new-password'
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                placeholder='••••••••'
              />
              {errors.password && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'
              >
                Confirm new password
              </label>
              <input
                id='confirmPassword'
                type='password'
                autoComplete='new-password'
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match',
                })}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              />
              {errors.confirmPassword && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className='rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>
                {serverError}
              </p>
            )}

            {successMessage && (
              <p className='rounded-md bg-green-50 px-3 py-2 text-sm text-green-700'>
                {successMessage}
              </p>
            )}

            <button
              type='submit'
              disabled={loading}
              className='flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70'
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>

          <div className='mt-6 flex justify-between text-sm text-gray-600'>
            <Link
              href='/login'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Back to login
            </Link>
            <Link
              href='/forgot-password'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Resend code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
