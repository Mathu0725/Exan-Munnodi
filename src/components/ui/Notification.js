'use client';

import { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';

/**
 * Notification component for displaying messages to users
 */
export default function Notification({
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 5000, // Auto-dismiss after 5 seconds (0 = no auto-dismiss)
  onClose,
  className = '',
  showIcon = true,
  showCloseButton = true,
  position = 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const icons = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    warning: FaExclamationTriangle,
    info: FaInfoCircle,
  };

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-400',
      title: 'text-green-900',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-400',
      title: 'text-red-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-900',
    },
  };

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match the transition duration
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed z-50 max-w-sm w-full mx-4
        ${positions[position]}
        ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      role='alert'
      aria-live='polite'
    >
      <div
        className={`
          ${colorScheme.bg} ${colorScheme.border}
          border rounded-lg shadow-lg p-4
          backdrop-blur-sm
        `}
      >
        <div className='flex items-start'>
          {/* Icon */}
          {showIcon && Icon && (
            <div className='flex-shrink-0'>
              <Icon className={`h-5 w-5 ${colorScheme.icon}`} />
            </div>
          )}

          {/* Content */}
          <div className={`ml-3 flex-1 ${showIcon ? '' : 'ml-0'}`}>
            {/* Title */}
            {title && (
              <h3 className={`text-sm font-medium ${colorScheme.title} mb-1`}>
                {title}
              </h3>
            )}

            {/* Message */}
            <div className={`text-sm ${colorScheme.text}`}>{message}</div>
          </div>

          {/* Close Button */}
          {showCloseButton && (
            <div className='ml-4 flex-shrink-0'>
              <button
                type='button'
                onClick={handleClose}
                className={`
                  ${colorScheme.text} hover:${colorScheme.icon}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  rounded-md p-1 transition-colors duration-200
                `}
                aria-label='Close notification'
              >
                <FaTimes className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
