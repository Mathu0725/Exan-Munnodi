'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaGraduationCap,
} from 'react-icons/fa';
import { registerSchema } from '@/lib/validations/forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import FormField from '@/components/forms/FormField';
import PasswordField from '@/components/forms/PasswordField';
import SelectField from '@/components/forms/SelectField';
import FormButton from '@/components/forms/FormButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Enhanced registration form with comprehensive validation
 */
export default function EnhancedRegisterForm({
  onSuccess,
  onError,
  className = '',
  showLogin = true,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { registerUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      institution: '',
      role: 'STUDENT',
    },
  });

  const password = watch('password');

  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  const onSubmit = async data => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    clearErrors();

    try {
      const result = await registerUser(data);

      if (result?.success) {
        const message =
          result.message ||
          'Registration submitted successfully! Please wait for admin approval.';
        setSuccessMessage(message);
        showSuccess(message);
        onSuccess?.(result);

        // Redirect to login after successful registration
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        throw new Error(result?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage =
        error?.message || 'Registration failed. Please try again.';
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
    <div className={`w-full max-w-2xl ${className}`}>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4'>
          <FaUser className='text-2xl text-indigo-600' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Create Account
        </h1>
        <p className='text-gray-600'>Join our exam management platform</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Name Field */}
          <FormField
            label='Full Name'
            name='name'
            type='text'
            placeholder='Enter your full name'
            required
            icon={FaUser}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='name'
          />

          {/* Email Field */}
          <FormField
            label='Email Address'
            name='email'
            type='email'
            placeholder='Enter your email'
            required
            icon={FaEnvelope}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='email'
          />

          {/* Phone Field */}
          <FormField
            label='Phone Number'
            name='phone'
            type='tel'
            placeholder='Enter your phone number'
            icon={FaPhone}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='tel'
          />

          {/* Institution Field */}
          <FormField
            label='Institution/School'
            name='institution'
            type='text'
            placeholder='Enter your institution'
            icon={FaGraduationCap}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='organization'
          />

          {/* Role Field */}
          <SelectField
            label='Account Type'
            name='role'
            options={roleOptions}
            placeholder='Select your role'
            required
            errors={errors}
            register={register}
            onChange={handleInputChange}
          />

          {/* Password Field */}
          <PasswordField
            label='Password'
            name='password'
            placeholder='Create a strong password'
            required
            icon={FaLock}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='new-password'
          />

          {/* Confirm Password Field */}
          <PasswordField
            label='Confirm Password'
            name='confirmPassword'
            placeholder='Confirm your password'
            required
            icon={FaLock}
            errors={errors}
            register={register}
            onChange={handleInputChange}
            autoComplete='new-password'
          />
        </div>

        {/* Password Requirements */}
        {password && (
          <div className='bg-gray-50 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Password Requirements:
            </h4>
            <ul className='text-xs text-gray-600 space-y-1'>
              <li
                className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='mr-2'>{password.length >= 8 ? '✓' : '✗'}</span>
                At least 8 characters
              </li>
              <li
                className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='mr-2'>
                  {/[A-Z]/.test(password) ? '✓' : '✗'}
                </span>
                One uppercase letter
              </li>
              <li
                className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='mr-2'>
                  {/[a-z]/.test(password) ? '✓' : '✗'}
                </span>
                One lowercase letter
              </li>
              <li
                className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='mr-2'>{/\d/.test(password) ? '✓' : '✗'}</span>
                One number
              </li>
              <li
                className={`flex items-center ${/[@$!%*?&]/.test(password) ? 'text-green-600' : 'text-red-600'}`}
              >
                <span className='mr-2'>
                  {/[@$!%*?&]/.test(password) ? '✓' : '✗'}
                </span>
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        )}

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
                  Registration Failed
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
                  Registration Successful
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
          disabled={!isValid || isSubmitting}
          className='w-full'
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </FormButton>

        {/* Footer Links */}
        {showLogin && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <a
                href='/login'
                className='text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
              >
                Sign in here
              </a>
            </p>
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
