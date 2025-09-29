'use client';

import { FaSpinner } from 'react-icons/fa';

/**
 * Loading spinner component with different sizes and styles
 */
export default function LoadingSpinner({
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  color = 'text-gray-600', // Tailwind color class
  className = '',
  text = '',
  overlay = false, // Show as overlay
  fullScreen = false, // Cover entire screen
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const spinnerClass = `
    animate-spin ${sizes[size]} ${color}
    ${className}
  `.trim();

  const content = (
    <div className='flex flex-col items-center justify-center space-y-2'>
      <FaSpinner className={spinnerClass} />
      {text && <p className={`text-sm ${color} font-medium`}>{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'>
        {content}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'>
        {content}
      </div>
    );
  }

  return content;
}
