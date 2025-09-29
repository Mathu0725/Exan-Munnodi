'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import FormField from '@/components/forms/FormField';
import PasswordField from '@/components/forms/PasswordField';
import FormButton from '@/components/forms/FormButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Enhanced password reset form with comprehensive validation
 */
export default function EnhancedPasswordResetForm({
  onSuccess,
  onError,
  className = '',
  mode = 'request', // 'request' or 'reset'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(mode); // 'request', 'reset', 'success'

  const { requestPasswordReset, resetPassword } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Request form
  const requestForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  // Reset form
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
      otp: '',
    },
  });

  const handleRequestSubmit = async data => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    requestForm.clearErrors();

    try {
      const result = await requestPasswordReset(data);

      if (result?.success) {
        const message = 'Password reset instructions sent to your email!';
        setSuccessMessage(message);
        showSuccess(message);
        setStep('success');
        onSuccess?.(result);
      } else {
        throw new Error(result?.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      const errorMessage =
        error?.message ||
        'Failed to send reset instructions. Please try again.';
      setServerError(errorMessage);
      showError(errorMessage);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async data => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    resetForm.clearErrors();

    try {
      const result = await resetPassword(data);

      if (result?.success) {
        const message = 'Password reset successfully! Redirecting to login...';
        setSuccessMessage(message);
        showSuccess(message);
        onSuccess?.(result);

        // Redirect to login after successful reset
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        throw new Error(result?.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage =
        error?.message || 'Password reset failed. Please try again.';
      setServerError(errorMessage);
      showError(errorMessage);

      // Set field-specific errors if available
      if (error?.details?.errors) {
        Object.entries(error.details.errors).forEach(([field, message]) => {
          resetForm.setError(field, { type: 'server', message });
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

  // Request Step
  if (step === 'request') {
    return (
      <div className={`w-full max-w-md ${className}`}>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4'>
            <FaEnvelope className='text-2xl text-yellow-600' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Forgot Password?
          </h1>
          <p className='text-gray-600'>
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
          className='space-y-6'
        >
          {/* Email Field */}
          <FormField
            label='Email Address'
            name='email'
            type='email'
            placeholder='Enter your email address'
            required
            icon={FaEnvelope}
            errors={requestForm.formState.errors}
            register={requestForm.register}
            onChange={handleInputChange}
            autoComplete='email'
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
                    Request Failed
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
                  <h3 className='text-sm font-medium text-green-800'>
                    Instructions Sent
                  </h3>
                  <div className='mt-2 text-sm text-green-700'>
                    <p>{successMessage}</p>
                  </div>
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
            disabled={!requestForm.formState.isValid || isSubmitting}
            className='w-full'
          >
            {isSubmitting
              ? 'Sending Instructions...'
              : 'Send Reset Instructions'}
          </FormButton>

          {/* Back to Login */}
          <div className='mt-6 text-center'>
            <a
              href='/login'
              className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
            >
              ← Back to Login
            </a>
          </div>
        </form>
      </div>
    );
  }

  // Reset Step
  if (step === 'reset') {
    return (
      <div className={`w-full max-w-md ${className}`}>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
            <FaKey className='text-2xl text-green-600' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Reset Password
          </h1>
          <p className='text-gray-600'>Enter your new password</p>
        </div>

        {/* Form */}
        <form
          onSubmit={resetForm.handleSubmit(handleResetSubmit)}
          className='space-y-6'
        >
          {/* Token Field (Hidden) */}
          <input type='hidden' {...resetForm.register('token')} />

          {/* OTP Field (Optional) */}
          <FormField
            label='Verification Code (Optional)'
            name='otp'
            type='text'
            placeholder='Enter 6-digit code if required'
            icon={FaKey}
            errors={resetForm.formState.errors}
            register={resetForm.register}
            onChange={handleInputChange}
            maxLength={6}
          />

          {/* New Password Field */}
          <PasswordField
            label='New Password'
            name='password'
            placeholder='Enter your new password'
            required
            icon={FaLock}
            errors={resetForm.formState.errors}
            register={resetForm.register}
            onChange={handleInputChange}
            autoComplete='new-password'
          />

          {/* Confirm Password Field */}
          <PasswordField
            label='Confirm New Password'
            name='confirmPassword'
            placeholder='Confirm your new password'
            required
            icon={FaLock}
            errors={resetForm.formState.errors}
            register={resetForm.register}
            onChange={handleInputChange}
            autoComplete='new-password'
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
                    Reset Failed
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
                  <h3 className='text-sm font-medium text-green-800'>
                    Password Reset Successful
                  </h3>
                  <div className='mt-2 text-sm text-green-700'>
                    <p>{successMessage}</p>
                  </div>
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
            disabled={!resetForm.formState.isValid || isSubmitting}
            className='w-full'
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </FormButton>

          {/* Back to Login */}
          <div className='mt-6 text-center'>
            <a
              href='/login'
              className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
            >
              ← Back to Login
            </a>
          </div>
        </form>
      </div>
    );
  }

  // Success Step
  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className='text-center'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
          <svg
            className='h-8 w-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Check Your Email
        </h1>
        <p className='text-gray-600 mb-8'>
          We&apos;ve sent password reset instructions to your email address.
        </p>
        <FormButton
          onClick={() => router.push('/login')}
          variant='primary'
          size='lg'
          className='w-full'
        >
          Back to Login
        </FormButton>
      </div>
    </div>
  );
}
