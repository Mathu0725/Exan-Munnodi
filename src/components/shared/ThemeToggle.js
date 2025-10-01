'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-12 h-6 bg-gray-200 rounded-full p-1 ${className}`}>
        <div className='w-4 h-4 bg-white rounded-full shadow-sm'></div>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
        ${isAnimating ? 'animate-bounce-gentle' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <div
        className={`
          absolute top-1 w-4 h-4 bg-white rounded-full shadow-md
          transition-all duration-300 ease-in-out
          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {/* Icon inside toggle */}
        <div className='flex items-center justify-center w-full h-full'>
          {theme === 'dark' ? (
            <svg
              className='w-2.5 h-2.5 text-blue-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
                clipRule='evenodd'
              />
            </svg>
          ) : (
            <svg
              className='w-2.5 h-2.5 text-gray-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

// Alternative compact toggle
export function CompactThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <svg
          className='w-5 h-5 text-gray-600 dark:text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg
          className='w-5 h-5 text-yellow-500'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
            clipRule='evenodd'
          />
        </svg>
      ) : (
        <svg
          className='w-5 h-5 text-gray-600'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
        </svg>
      )}
    </button>
  );
}
