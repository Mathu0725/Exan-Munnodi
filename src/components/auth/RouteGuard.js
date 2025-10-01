'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/ToastContainer';

/**
 * Route guard component for protecting routes based on authentication and roles
 */
export default function RouteGuard({ children, config = {}, className = '' }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showError, showWarning } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  // Default configuration
  const defaultConfig = {
    // Public routes that don't require authentication
    publicRoutes: [
      '/',
      '/login',
      '/login-3d',
      '/register',
      '/forgot-password',
      '/forgot-password-3d',
      '/reset-password',
      '/reset-with-otp',
    ],

    // Routes that require authentication but no specific role
    protectedRoutes: [
      '/profile',
      '/dashboard',
      '/exams',
      '/questions',
      '/subjects',
      '/categories',
      '/student-groups',
    ],

    // Routes that require specific roles
    roleRoutes: {
      '/admin': ['ADMIN'],
      '/admin/create-staff': ['ADMIN'],
      '/admin/staff-management': ['ADMIN'],
      '/admin/exam-reports': ['ADMIN'],
      '/audit-logs': ['ADMIN'],
      '/bulk-actions': ['ADMIN'],
      '/users': ['ADMIN'],
    },

    // Redirects for different scenarios
    redirects: {
      unauthenticated: '/login',
      unauthorized: '/',
      default: '/',
    },

    // Options
    options: {
      showLoading: true,
      showErrors: true,
      checkOnMount: true,
      checkOnRouteChange: true,
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  const isPublicRoute = path => {
    return finalConfig.publicRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const isProtectedRoute = path => {
    return finalConfig.protectedRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const getRequiredRole = path => {
    for (const [route, roles] of Object.entries(finalConfig.roleRoutes)) {
      if (path === route || path.startsWith(route + '/')) {
        return roles;
      }
    }
    return null;
  };

  const checkAccess = useCallback(async () => {
    if (loading) return;

    // If it's a public route, allow access
    if (isPublicRoute(pathname)) {
      setAccessGranted(true);
      setIsChecking(false);
      return;
    }

    // If no user and it's a protected route, redirect to login
    if (!user && (isProtectedRoute(pathname) || getRequiredRole(pathname))) {
      if (finalConfig.options.showErrors) {
        showError('Please log in to access this page');
      }
      router.replace(finalConfig.redirects.unauthenticated);
      return;
    }

    // If user exists, check role requirements
    if (user) {
      const requiredRoles = getRequiredRole(pathname);

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        if (finalConfig.options.showErrors) {
          showError(
            `Access denied. This page requires ${requiredRoles.join(' or ')} privileges.`
          );
        }
        router.replace(finalConfig.redirects.unauthorized);
        return;
      }

      // If user is authenticated and on auth pages, redirect to dashboard
      if (
        (isPublicRoute(pathname) && pathname.includes('login')) ||
        pathname.includes('register')
      ) {
        router.replace('/');
        return;
      }
    }

    setAccessGranted(true);
    setIsChecking(false);
  }, [
    loading,
    pathname,
    user,
    router,
    showError,
    isPublicRoute,
    isProtectedRoute,
    getRequiredRole,
    finalConfig,
  ]);

  useEffect(() => {
    if (finalConfig.options.checkOnMount) {
      checkAccess();
    }
  }, [user, loading, pathname, checkAccess]);

  useEffect(() => {
    if (finalConfig.options.checkOnRouteChange) {
      checkAccess();
    }
  }, [pathname, checkAccess]);

  // Show loading spinner while checking
  if (loading || isChecking) {
    if (finalConfig.options.showLoading) {
      return (
        <div
          className={`flex items-center justify-center min-h-screen ${className}`}
        >
          <LoadingSpinner
            size='lg'
            text='Checking access...'
            className='text-center'
          />
        </div>
      );
    }
    return null;
  }

  // If access is not granted, don't render children
  if (!accessGranted) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook for checking route access
 */
export function useRouteAccess() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = path => {
    const publicRoutes = [
      '/',
      '/login',
      '/login-3d',
      '/register',
      '/forgot-password',
      '/forgot-password-3d',
      '/reset-password',
      '/reset-with-otp',
    ];
    return publicRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const isProtectedRoute = path => {
    const protectedRoutes = [
      '/profile',
      '/dashboard',
      '/exams',
      '/questions',
      '/subjects',
      '/categories',
      '/student-groups',
    ];
    return protectedRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const getRequiredRole = path => {
    const roleRoutes = {
      '/admin': ['ADMIN'],
      '/admin/create-staff': ['ADMIN'],
      '/admin/staff-management': ['ADMIN'],
      '/admin/exam-reports': ['ADMIN'],
      '/audit-logs': ['ADMIN'],
      '/bulk-actions': ['ADMIN'],
      '/users': ['ADMIN'],
    };

    for (const [route, roles] of Object.entries(roleRoutes)) {
      if (path === route || path.startsWith(route + '/')) {
        return roles;
      }
    }
    return null;
  };

  const canAccess = (path = pathname) => {
    if (loading) return false;

    if (isPublicRoute(path)) return true;

    if (!user) return false;

    const requiredRoles = getRequiredRole(path);
    if (requiredRoles && !requiredRoles.includes(user.role)) return false;

    return true;
  };

  const requiresAuth = (path = pathname) => {
    return isProtectedRoute(path) || getRequiredRole(path) !== null;
  };

  const requiresRole = (role, path = pathname) => {
    const requiredRoles = getRequiredRole(path);
    return requiredRoles && requiredRoles.includes(role);
  };

  return {
    user,
    loading,
    canAccess,
    requiresAuth,
    requiresRole,
    isPublicRoute: isPublicRoute(pathname),
    isProtectedRoute: isProtectedRoute(pathname),
    requiredRole: getRequiredRole(pathname),
  };
}
