'use client';

import { forwardRef } from 'react';
import { formA11y, aria, screenReader } from '@/lib/accessibility/a11y';

/**
 * Accessible form field wrapper
 */
export const AccessibleFormField = forwardRef(
  (
    {
      children,
      label,
      name,
      required = false,
      error,
      helpText,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasHelp = !!helpText;
    const describedBy = formA11y.getDescribedBy(name, hasError, hasHelp);

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={name}
            className='block text-sm font-medium text-gray-700'
          >
            {label}
            {required && (
              <span className='text-red-500 ml-1' aria-label='required'>
                *
              </span>
            )}
          </label>
        )}

        {/* Field */}
        <div>{children}</div>

        {/* Help Text */}
        {helpText && (
          <p id={formA11y.getHelpId(name)} className='text-sm text-gray-500'>
            {helpText}
          </p>
        )}

        {/* Error Message */}
        {hasError && (
          <p
            id={formA11y.getErrorId(name)}
            className='text-sm text-red-600'
            role='alert'
            aria-live='polite'
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';

/**
 * Accessible input component
 */
export const AccessibleInput = forwardRef(
  (
    {
      name,
      type = 'text',
      required = false,
      error,
      helpText,
      label,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const describedBy = formA11y.getDescribedBy(name, hasError, !!helpText);

    return (
      <AccessibleFormField
        label={label}
        name={name}
        required={required}
        error={error}
        helpText={helpText}
      >
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          required={required}
          aria-invalid={formA11y.getAriaInvalid(hasError)}
          aria-describedby={describedBy}
          className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${className}
        `.trim()}
          {...props}
        />
      </AccessibleFormField>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

/**
 * Accessible button component
 */
export const AccessibleButton = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = e => {
      // Handle space and enter keys
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!disabled && !loading && onClick) {
          onClick(e);
        }
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const buttonClass = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

    return (
      <button
        ref={ref}
        type='button'
        disabled={disabled || loading}
        className={buttonClass}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled || loading}
        {...aria.button(props)}
      >
        {loading && (
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Accessible dialog component
 */
export const AccessibleDialog = forwardRef(
  ({ children, isOpen, onClose, title, className = '', ...props }, ref) => {
    const handleKeyDown = e => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        onClick={onClose}
      >
        <div
          ref={ref}
          className={`
          bg-white rounded-lg shadow-xl max-w-md w-full mx-4
          focus:outline-none
          ${className}
        `.trim()}
          onClick={e => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          {...aria.dialog(props)}
        >
          {title && (
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
            </div>
          )}
          <div className='px-6 py-4'>{children}</div>
        </div>
      </div>
    );
  }
);

AccessibleDialog.displayName = 'AccessibleDialog';

/**
 * Accessible alert component
 */
export const AccessibleAlert = forwardRef(
  ({ children, type = 'info', className = '', ...props }, ref) => {
    const types = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const alertClass = `
    border rounded-md p-4
    ${types[type]}
    ${className}
  `.trim();

    return (
      <div ref={ref} className={alertClass} {...aria.alert(props)}>
        {children}
      </div>
    );
  }
);

AccessibleAlert.displayName = 'AccessibleAlert';

/**
 * Accessible progress bar component
 */
export const AccessibleProgressBar = forwardRef(
  ({ value, max = 100, label, className = '', ...props }, ref) => {
    const percentage = Math.round((value / max) * 100);

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-gray-700'>{label}</span>
            <span className='text-sm text-gray-500'>{percentage}%</span>
          </div>
        )}
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            ref={ref}
            className='bg-indigo-600 h-2 rounded-full transition-all duration-300'
            style={{ width: `${percentage}%` }}
            {...aria.progressbar(value, max, props)}
          />
        </div>
      </div>
    );
  }
);

AccessibleProgressBar.displayName = 'AccessibleProgressBar';
