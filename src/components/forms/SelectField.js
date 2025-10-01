'use client';

import { forwardRef } from 'react';
import {
  getFieldError,
  hasFieldError,
  getFieldClassName,
} from '@/lib/validations/forms';

/**
 * Reusable select field component with validation
 */
const SelectField = forwardRef(
  (
    {
      label,
      name,
      options = [],
      placeholder = 'Select an option',
      required = false,
      disabled = false,
      className = '',
      selectClassName = '',
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

    const baseSelectClass = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

    const selectClass = getFieldClassName(
      errors,
      name,
      `${baseSelectClass} ${selectClassName}`
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

        {/* Select */}
        <select
          ref={ref}
          id={name}
          name={name}
          required={required}
          disabled={disabled}
          className={selectClass}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...register?.(name)}
          {...props}
        >
          <option value='' disabled>
            {placeholder}
          </option>
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

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

SelectField.displayName = 'SelectField';

export default SelectField;
