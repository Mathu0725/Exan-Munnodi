'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/ToastContainer';

/**
 * Protected route wrapper component
 */
export default function ProtectedRoute({
  children,
  requiredRole = null, // 'ADMIN', 'TEACHER', 'STUDENT', or null for any authenticated user
  fallback = null, // Custom fallback component
  redirectTo = '/login',
  showLoading = true,
  className = '',
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showError } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // If no user, redirect to login
      if (!user) {
        showError('Please log in to access this page');
        router.replace(redirectTo);
        return;
      }

      // If role is required, check if user has the required role
      if (requiredRole && user.role !== requiredRole) {
        showError(
          `Access denied. This page requires ${requiredRole} privileges.`
        );
        router.replace('/');
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [user, loading, requiredRole, router, pathname, showError, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    if (fallback) {
      return fallback;
    }

    if (showLoading) {
      return (
        <div
          className={`flex items-center justify-center min-h-screen ${className}`}
        >
          <LoadingSpinner
            size='lg'
            text='Checking authentication...'
            className='text-center'
          />
        </div>
      );
    }

    return null;
  }

  // If no user after loading, don't render children
  if (!user) {
    return null;
  }

  // If role is required and user doesn't have it, don't render children
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth(WrappedComponent, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking if user has required role
 */
export function useRoleCheck(requiredRole) {
  const { user, loading } = useAuth();
  const { showError } = useToast();

  const hasRole = user?.role === requiredRole;
  const isChecking = loading;

  const checkAccess = () => {
    if (!user) {
      showError('Please log in to access this feature');
      return false;
    }

    if (requiredRole && !hasRole) {
      showError(`This feature requires ${requiredRole} privileges`);
      return false;
    }

    return true;
  };

  return {
    hasRole,
    isChecking,
    checkAccess,
    user,
  };
}
