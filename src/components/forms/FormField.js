'use client';

import { forwardRef } from 'react';
import {
  getFieldError,
  hasFieldError,
  getFieldClassName,
} from '@/lib/validations/forms';

/**
 * Reusable form field component with validation
 */
const FormField = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      required = false,
      disabled = false,
      className = '',
      inputClassName = '',
      labelClassName = '',
      errorClassName = '',
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      errors = {},
      register,
      ...props
    },
    ref
  ) => {
    const hasError = hasFieldError(errors, name);
    const errorMessage = getFieldError(errors, name);

    const baseInputClass = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

    const inputClass = getFieldClassName(
      errors,
      name,
      `${baseInputClass} ${inputClassName}`
    );

    const iconPadding = Icon ? 'pl-10' : '';
    const rightIconPadding = RightIcon ? 'pr-10' : '';
    const finalInputClass =
      `${inputClass} ${iconPadding} ${rightIconPadding}`.trim();

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
          >
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className='relative'>
          {/* Left Icon */}
          {Icon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Icon className='h-5 w-5 text-gray-400' />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={finalInputClass}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
            {...register?.(name)}
            {...props}
          />

          {/* Right Icon */}
          {RightIcon && (
            <button
              type='button'
              onClick={onRightIconClick}
              className='absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors'
              disabled={disabled}
            >
              <RightIcon className='h-5 w-5 text-gray-400' />
            </button>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={`${name}-error`}
            className={`text-sm text-red-600 ${errorClassName}`}
            role='alert'
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
