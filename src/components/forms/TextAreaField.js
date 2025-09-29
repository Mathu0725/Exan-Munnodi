'use client';

import { forwardRef } from 'react';
import {
  getFieldError,
  hasFieldError,
  getFieldClassName,
} from '@/lib/validations/forms';

/**
 * Reusable textarea field component with validation
 */
const TextAreaField = forwardRef(
  (
    {
      label,
      name,
      placeholder,
      required = false,
      disabled = false,
      rows = 4,
      className = '',
      textareaClassName = '',
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

    const baseTextareaClass = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200 resize-vertical
  `;

    const textareaClass = getFieldClassName(
      errors,
      name,
      `${baseTextareaClass} ${textareaClassName}`
    );

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

        {/* Textarea */}
        <textarea
          ref={ref}
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={textareaClass}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...register?.(name)}
          {...props}
        />

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

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
