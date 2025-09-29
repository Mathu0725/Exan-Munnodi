'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import { sessionManager } from '@/lib/session/sessionManager';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import FormButton from '@/components/forms/FormButton';
import ProgressBar from '@/components/ui/ProgressBar';

/**
 * Session timeout warning component
 */
export default function SessionTimeoutWarning({
  warningMinutes = 5, // Show warning 5 minutes before expiry
  checkInterval = 30000, // Check every 30 seconds
  onExtendSession,
  onLogout,
  className = '',
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  const { logout } = useAuth();
  const { showWarning: showToastWarning } = useToast();

  const checkSession = useCallback(() => {
    const sessionInfo = sessionManager.getSessionInfo();

    if (!sessionInfo.isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const remaining = sessionManager.getSessionTimeRemaining();
    setTimeRemaining(remaining);

    // Show warning if session is expiring soon
    if (remaining <= warningMinutes && remaining > 0) {
      setShowWarning(true);
      if (remaining === warningMinutes) {
        showToastWarning(
          `Your session will expire in ${warningMinutes} minutes. Please save your work.`
        );
      }
    } else if (remaining <= 0) {
      // Session has expired
      handleLogout();
    }
  }, [warningMinutes, showToastWarning]);

  const handleExtendSession = async () => {
    setIsExtending(true);

    try {
      // Update session timestamp
      sessionManager.updateTimestamp();

      // Call custom extend session handler if provided
      if (onExtendSession) {
        await onExtendSession();
      }

      setShowWarning(false);
      setTimeRemaining(sessionManager.getSessionTimeRemaining());
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logout(false); // Don't show logout message
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStayLoggedIn = () => {
    handleExtendSession();
  };

  const handleLogoutNow = () => {
    handleLogout();
  };

  useEffect(() => {
    // Initial check
    checkSession();

    // Set up interval
    const interval = setInterval(checkSession, checkInterval);

    return () => clearInterval(interval);
  }, [checkSession, checkInterval]);

  // Don't render if warning is not shown
  if (!showWarning) {
    return null;
  }

  const progress = Math.max(0, (timeRemaining / (warningMinutes * 2)) * 100);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <div className='bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl'>
        <div className='text-center'>
          {/* Icon */}
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4'>
            <FaExclamationTriangle className='h-6 w-6 text-yellow-600' />
          </div>

          {/* Title */}
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Session Timeout Warning
          </h3>

          {/* Message */}
          <p className='text-sm text-gray-500 mb-4'>
            Your session will expire in{' '}
            <span className='font-semibold text-yellow-600'>
              {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
            </span>
            . Please save your work and extend your session to continue.
          </p>

          {/* Progress Bar */}
          <div className='mb-6'>
            <ProgressBar
              progress={progress}
              color='bg-yellow-500'
              backgroundColor='bg-gray-200'
              size='sm'
              showPercentage={false}
              label={`Time remaining: ${timeRemaining} min`}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex space-x-3'>
            <FormButton
              variant='outline'
              size='md'
              onClick={handleLogoutNow}
              className='flex-1'
            >
              Log Out Now
            </FormButton>
            <FormButton
              variant='primary'
              size='md'
              onClick={handleStayLoggedIn}
              loading={isExtending}
              disabled={isExtending}
              className='flex-1'
            >
              {isExtending ? 'Extending...' : 'Stay Logged In'}
            </FormButton>
          </div>

          {/* Additional Info */}
          <div className='mt-4 text-xs text-gray-400'>
            <div className='flex items-center justify-center space-x-1'>
              <FaClock className='h-3 w-3' />
              <span>Session will auto-logout if no action is taken</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Session status indicator component
 */
export function SessionStatusIndicator({
  className = '',
  showTimeRemaining = true,
  showWarning = true,
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const remaining = sessionManager.getSessionTimeRemaining();
      setTimeRemaining(remaining);
      setIsExpiringSoon(remaining <= 10 && remaining > 0); // Warning at 10 minutes
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!sessionManager.isAuthenticated()) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isExpiringSoon ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
        }`}
      />
      {showTimeRemaining && (
        <span
          className={`text-xs ${
            isExpiringSoon ? 'text-yellow-600' : 'text-gray-500'
          }`}
        >
          {timeRemaining}min
        </span>
      )}
      {showWarning && isExpiringSoon && (
        <span className='text-xs text-yellow-600 font-medium'>
          Session expiring soon
        </span>
      )}
    </div>
  );
}
