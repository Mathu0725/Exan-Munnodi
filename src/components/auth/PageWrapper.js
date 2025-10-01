'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusIndicator from '@/components/ui/StatusIndicator';

/**
 * Page wrapper component for protecting individual pages
 */
export default function PageWrapper({
  children,
  requiredRole = null,
  requiredPermissions = [],
  fallback = null,
  showLoading = true,
  showAccessDenied = true,
  className = '',
  ...props
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showError } = useToast();
  const [accessGranted, setAccessGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // If no user, deny access
      if (!user) {
        if (showAccessDenied) {
          showError('Please log in to access this page');
        }
        router.replace('/login');
        return;
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        if (showAccessDenied) {
          showError(
            `Access denied. This page requires ${requiredRole} privileges.`
          );
        }
        router.replace('/');
        return;
      }

      // Check permissions (if implemented)
      if (requiredPermissions.length > 0) {
        // This would need to be implemented based on your permission system
        const hasPermissions = requiredPermissions.every(permission =>
          user.permissions?.includes(permission)
        );

        if (!hasPermissions) {
          if (showAccessDenied) {
            showError(
              'You do not have the required permissions to access this page.'
            );
          }
          router.replace('/');
          return;
        }
      }

      setAccessGranted(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [
    user,
    loading,
    requiredRole,
    requiredPermissions,
    router,
    pathname,
    showError,
    showAccessDenied,
  ]);

  // Show loading while checking
  if (loading || isChecking) {
    if (fallback) {
      return fallback;
    }

    if (showLoading) {
      return (
        <div
          className={`flex items-center justify-center min-h-screen ${className}`}
        >
          <div className='text-center'>
            <LoadingSpinner size='lg' text='Checking access...' />
            <div className='mt-4'>
              <StatusIndicator
                status='loading'
                text='Verifying permissions...'
                size='sm'
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // If access is not granted, show access denied
  if (!accessGranted) {
    if (fallback) {
      return fallback;
    }

    return (
      <div
        className={`flex items-center justify-center min-h-screen ${className}`}
      >
        <div className='text-center max-w-md mx-auto p-8'>
          <StatusIndicator
            status='error'
            text='Access Denied'
            size='lg'
            className='mb-4'
          />
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h1>
          <p className='text-gray-600 mb-6'>
            You don&apos;t have permission to access this page.
          </p>
          <div className='space-y-3'>
            <button
              onClick={() => router.back()}
              className='w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors'
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className='w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors'
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * Higher-order component for protecting pages
 */
export function withPageProtection(WrappedComponent, options = {}) {
  return function ProtectedPage(props) {
    return (
      <PageWrapper {...options}>
        <WrappedComponent {...props} />
      </PageWrapper>
    );
  };
}

/**
 * Hook for checking page access
 */
export function usePageAccess(requiredRole = null, requiredPermissions = []) {
  const { user, loading } = useAuth();
  const { showError } = useToast();

  const checkAccess = () => {
    if (loading) return { allowed: false, reason: 'loading' };

    if (!user) return { allowed: false, reason: 'unauthenticated' };

    if (requiredRole && user.role !== requiredRole) {
      return { allowed: false, reason: 'unauthorized' };
    }

    if (requiredPermissions.length > 0) {
      const hasPermissions = requiredPermissions.every(permission =>
        user.permissions?.includes(permission)
      );

      if (!hasPermissions) {
        return { allowed: false, reason: 'insufficient_permissions' };
      }
    }

    return { allowed: true, reason: 'authorized' };
  };

  const { allowed, reason } = checkAccess();

  return {
    user,
    loading,
    allowed,
    reason,
    checkAccess,
  };
}
