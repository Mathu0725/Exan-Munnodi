'use client';

import { useState, useEffect } from 'react';

/**
 * Progress bar component with different styles and animations
 */
export default function ProgressBar({
  progress = 0, // 0-100
  size = 'md', // 'sm', 'md', 'lg'
  color = 'bg-indigo-600', // Tailwind color class
  backgroundColor = 'bg-gray-200', // Tailwind color class
  showPercentage = true,
  animated = true,
  striped = false,
  className = '',
  label = '',
}) {
  const [displayProgress, setDisplayProgress] = useState(0);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  const progressClass = `
    ${sizes[size]} ${color} rounded-full
    transition-all duration-300 ease-out
    ${animated ? 'animate-pulse' : ''}
    ${striped ? 'bg-stripes' : ''}
  `.trim();

  const containerClass = `
    ${sizes[size]} ${backgroundColor} rounded-full overflow-hidden
    ${className}
  `.trim();

  useEffect(() => {
    // Animate progress changes
    const timer = setTimeout(() => {
      setDisplayProgress(Math.min(100, Math.max(0, progress)));
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className='w-full'>
      {/* Label */}
      {label && (
        <div className='flex justify-between items-center mb-1'>
          <span className='text-sm font-medium text-gray-700'>{label}</span>
          {showPercentage && (
            <span className='text-sm text-gray-500'>
              {Math.round(displayProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={containerClass}>
        <div
          className={progressClass}
          style={{ width: `${displayProgress}%` }}
          role='progressbar'
          aria-valuenow={displayProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        />
      </div>

      {/* Percentage without label */}
      {!label && showPercentage && (
        <div className='text-right mt-1'>
          <span className='text-xs text-gray-500'>
            {Math.round(displayProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}
