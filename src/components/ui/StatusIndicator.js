'use client';

import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
} from 'react-icons/fa';

/**
 * Status indicator component for showing different states
 */
export default function StatusIndicator({
  status = 'info', // 'success', 'error', 'warning', 'info', 'loading'
  size = 'md', // 'sm', 'md', 'lg'
  text = '',
  className = '',
  animated = true,
}) {
  const icons = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    warning: FaExclamationTriangle,
    info: FaInfoCircle,
    loading: FaSpinner,
  };

  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    loading: 'text-gray-500',
  };

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const Icon = icons[status];
  const colorClass = colors[status];
  const sizeClass = sizes[size];

  const iconClass = `
    ${sizeClass} ${colorClass}
    ${status === 'loading' && animated ? 'animate-spin' : ''}
    ${status === 'success' && animated ? 'animate-pulse' : ''}
  `.trim();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon className={iconClass} />
      {text && (
        <span className={`text-sm font-medium ${colorClass}`}>{text}</span>
      )}
    </div>
  );
}
