'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import FormButton from '@/components/forms/FormButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FaSignOutAlt, FaSpinner } from 'react-icons/fa';

/**
 * Logout button component with confirmation
 */
export default function LogoutButton({
  variant = 'outline',
  size = 'md',
  showConfirmation = true,
  confirmationMessage = 'Are you sure you want to log out?',
  onLogout,
  className = '',
  children,
  ...props
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout(true);
      showSuccess('Logged out successfully');
      onLogout?.();
    } catch (error) {
      showError('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleClick = () => {
    if (showConfirmation) {
      setShowConfirm(true);
    } else {
      handleLogout();
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    handleLogout();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
              <FaSignOutAlt className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Confirm Logout
            </h3>
            <p className='text-sm text-gray-500 mb-6'>{confirmationMessage}</p>
            <div className='flex space-x-3'>
              <FormButton
                variant='outline'
                size='md'
                onClick={handleCancel}
                disabled={isLoggingOut}
                className='flex-1'
              >
                Cancel
              </FormButton>
              <FormButton
                variant='danger'
                size='md'
                onClick={handleConfirm}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                className='flex-1'
              >
                {isLoggingOut ? (
                  <>
                    <FaSpinner className='animate-spin mr-2' />
                    Logging Out...
                  </>
                ) : (
                  'Log Out'
                )}
              </FormButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormButton
      variant={variant}
      size={size}
      onClick={handleClick}
      loading={isLoggingOut}
      disabled={isLoggingOut}
      className={className}
      icon={FaSignOutAlt}
      {...props}
    >
      {children || (isLoggingOut ? 'Logging Out...' : 'Log Out')}
    </FormButton>
  );
}

/**
 * Logout menu item component
 */
export function LogoutMenuItem({
  onLogout,
  className = '',
  children,
  ...props
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout(true);
      showSuccess('Logged out successfully');
      onLogout?.();
    } catch (error) {
      showError('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center space-x-2
        ${className}
      `}
      {...props}
    >
      {isLoggingOut ? (
        <FaSpinner className='animate-spin h-4 w-4' />
      ) : (
        <FaSignOutAlt className='h-4 w-4' />
      )}
      <span>{children || (isLoggingOut ? 'Logging Out...' : 'Log Out')}</span>
    </button>
  );
}

/**
 * Logout dropdown component
 */
export function LogoutDropdown({ user, className = '', ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    try {
      await logout(true);
      showSuccess('Logged out successfully');
      setIsOpen(false);
    } catch (error) {
      showError('Failed to log out. Please try again.');
    }
  };

  return (
    <div className={`relative ${className}`} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900'
      >
        <div className='w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium'>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className='hidden md:block'>{user?.name || 'User'}</span>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20'>
            <div className='px-4 py-2 text-sm text-gray-500 border-b'>
              {user?.email}
            </div>
            <LogoutMenuItem onLogout={() => setIsOpen(false)}>
              Log Out
            </LogoutMenuItem>
          </div>
        </>
      )}
    </div>
  );
}
