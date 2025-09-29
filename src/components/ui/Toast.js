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
 * Toast notification component for quick messages
 */
export default function Toast({
  type = 'info', // 'success', 'error', 'warning', 'info'
  message,
  duration = 3000, // Auto-dismiss after 3 seconds
  onClose,
  className = '',
  position = 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
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
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
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
  const colorClass = colors[type];

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
        ${isExiting ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      role='alert'
      aria-live='polite'
    >
      <div
        className={`
          ${colorClass}
          rounded-lg shadow-lg p-4 flex items-center
          backdrop-blur-sm
        `}
      >
        {/* Icon */}
        <Icon className='h-5 w-5 mr-3 flex-shrink-0' />

        {/* Message */}
        <div className='flex-1 text-sm font-medium'>{message}</div>

        {/* Close Button */}
        <button
          type='button'
          onClick={handleClose}
          className='ml-3 flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200'
          aria-label='Close toast'
        >
          <FaTimes className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
