'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { loginSchema } from '@/lib/validations/forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import FormField from '@/components/forms/FormField';
import PasswordField from '@/components/forms/PasswordField';
import FormButton from '@/components/forms/FormButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Enhanced login form with comprehensive validation
 */
export default function EnhancedLoginForm({
  onSuccess,
  onError,
  className = '',
  showForgotPassword = true,
  showRegister = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async data => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    clearErrors();

    try {
      const result = await login(data);

      if (result?.success) {
        setSuccessMessage('Login successful! Redirecting...');
        showSuccess('Login successful! Redirecting...');
        onSuccess?.(result);
        router.push('/');
      } else {
        throw new Error(result?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      setServerError(errorMessage);
      showError(errorMessage);

      // Set field-specific errors if available
      if (error?.details?.errors) {
        Object.entries(error.details.errors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      }

      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = () => {
    if (serverError) {
      setServerError('');
    }
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4'>
          <FaUser className='text-2xl text-indigo-600' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
        <p className='text-gray-600'>Sign in to your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Email Field */}
        <FormField
          label='Email Address'
          name='email'
          type='email'
          placeholder='Enter your email'
          required
          icon={FaUser}
          errors={errors}
          register={register}
          onChange={handleInputChange}
          autoComplete='email'
        />

        {/* Password Field */}
        <PasswordField
          label='Password'
          name='password'
          placeholder='Enter your password'
          required
          icon={FaLock}
          errors={errors}
          register={register}
          onChange={handleInputChange}
          autoComplete='current-password'
        />

        {/* Server Error Message */}
        {serverError && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  Login Failed
                </h3>
                <div className='mt-2 text-sm text-red-700'>
                  <p>{serverError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className='bg-green-50 border border-green-200 rounded-md p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-green-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-green-800'>
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <FormButton
          type='submit'
          variant='primary'
          size='lg'
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          className='w-full'
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </FormButton>

        {/* Footer Links */}
        {(showForgotPassword || showRegister) && (
          <div className='mt-6 text-center space-y-4'>
            <div className='flex items-center justify-center space-x-4 text-sm'>
              {showForgotPassword && (
                <a
                  href='/forgot-password'
                  className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
                >
                  Forgot Password?
                </a>
              )}
              {showForgotPassword && showRegister && (
                <span className='text-gray-300'>•</span>
              )}
              {showRegister && (
                <a
                  href='/register'
                  className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
                >
                  Create Account
                </a>
              )}
            </div>
          </div>
        )}

        {/* Form Status */}
        <div className='text-xs text-gray-500 text-center'>
          {isDirty && !isValid && (
            <p>Please fix the errors above to continue</p>
          )}
          {isValid && !isSubmitting && (
            <p className='text-green-600'>
              ✓ Form is valid and ready to submit
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
