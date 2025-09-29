'use client';

import { forwardRef } from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Reusable form button component with loading states
 */
const FormButton = forwardRef(
  (
    {
      children,
      type = 'button',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const baseClass = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

    const variants = {
      primary: `
      bg-indigo-600 text-white hover:bg-indigo-700
      focus:ring-indigo-500 shadow-sm
    `,
      secondary: `
      bg-gray-600 text-white hover:bg-gray-700
      focus:ring-gray-500 shadow-sm
    `,
      success: `
      bg-green-600 text-white hover:bg-green-700
      focus:ring-green-500 shadow-sm
    `,
      danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500 shadow-sm
    `,
      warning: `
      bg-yellow-600 text-white hover:bg-yellow-700
      focus:ring-yellow-500 shadow-sm
    `,
      outline: `
      border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
      focus:ring-indigo-500 shadow-sm
    `,
      ghost: `
      text-gray-700 hover:bg-gray-100
      focus:ring-gray-500
    `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const buttonClass = `
    ${baseClass}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={buttonClass}
        {...props}
      >
        {loading && <FaSpinner className='animate-spin mr-2 h-4 w-4' />}

        {Icon && !loading && <Icon className='mr-2 h-4 w-4' />}

        {children}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';

export default FormButton;
