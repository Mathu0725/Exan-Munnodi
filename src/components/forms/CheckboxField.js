'use client';

import { forwardRef } from 'react';
import { getFieldError, hasFieldError } from '@/lib/validations/forms';

/**
 * Reusable checkbox field component with validation
 */
const CheckboxField = forwardRef(
  (
    {
      label,
      name,
      required = false,
      disabled = false,
      className = '',
      checkboxClassName = '',
      labelClassName = '',
      errorClassName = '',
      errors = {},
      register,
      ...props
    },
    ref
  ) => {
    const hasError = hasFieldError(errors, name);
    const errorMessage = getFieldError(errors, name);

    const baseCheckboxClass = `
    h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

    const checkboxClass = hasError
      ? `${baseCheckboxClass} border-red-500 focus:ring-red-500 ${checkboxClassName}`
      : `${baseCheckboxClass} ${checkboxClassName}`;

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Checkbox Container */}
        <div className='flex items-start'>
          <div className='flex items-center h-5'>
            <input
              ref={ref}
              id={name}
              name={name}
              type='checkbox'
              required={required}
              disabled={disabled}
              className={checkboxClass}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : undefined}
              {...register?.(name)}
              {...props}
            />
          </div>

          {/* Label */}
          {label && (
            <div className='ml-3 text-sm'>
              <label
                htmlFor={name}
                className={`font-medium text-gray-700 ${labelClassName}`}
              >
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
              </label>
            </div>
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

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
