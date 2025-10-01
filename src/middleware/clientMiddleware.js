'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastContainer';

/**
 * Client-side middleware for route protection
 */
export function useClientMiddleware(options = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showError, showWarning } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultOptions = {
    // Routes that don't require authentication
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

    // Routes that require authentication
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

    // Redirect paths
    redirects: {
      unauthenticated: '/login',
      unauthorized: '/',
      authenticated: '/',
    },

    // Options
    options: {
      showErrors: true,
      showWarnings: true,
      checkOnMount: true,
      checkOnRouteChange: true,
      preventAccess: true,
    },
  };

  const config = { ...defaultOptions, ...options };

  const isPublicRoute = path => {
    return config.publicRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const isProtectedRoute = path => {
    return config.protectedRoutes.some(
      route => path === route || path.startsWith(route + '/')
    );
  };

  const getRequiredRole = path => {
    for (const [route, roles] of Object.entries(config.roleRoutes)) {
      if (path === route || path.startsWith(route + '/')) {
        return roles;
      }
    }
    return null;
  };

  const checkRouteAccess = () => {
    if (loading) return { allowed: false, reason: 'loading' };

    // Public routes are always allowed
    if (isPublicRoute(pathname)) {
      return { allowed: true, reason: 'public' };
    }

    // Protected routes require authentication
    if (isProtectedRoute(pathname) || getRequiredRole(pathname)) {
      if (!user) {
        if (config.options.showErrors) {
          showError('Please log in to access this page');
        }
        return { allowed: false, reason: 'unauthenticated' };
      }

      // Check role requirements
      const requiredRoles = getRequiredRole(pathname);
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        if (config.options.showErrors) {
          showError(
            `Access denied. This page requires ${requiredRoles.join(' or ')} privileges.`
          );
        }
        return { allowed: false, reason: 'unauthorized' };
      }
    }

    // If user is authenticated and on auth pages, redirect to dashboard
    if (user && (pathname.includes('login') || pathname.includes('register'))) {
      if (config.options.showWarnings) {
        showWarning('You are already logged in');
      }
      return { allowed: false, reason: 'already_authenticated' };
    }

    return { allowed: true, reason: 'authorized' };
  };

  const handleRouteChange = () => {
    const { allowed, reason } = checkRouteAccess();

    if (!allowed) {
      switch (reason) {
        case 'unauthenticated':
          router.replace(config.redirects.unauthenticated);
          break;
        case 'unauthorized':
          router.replace(config.redirects.unauthorized);
          break;
        case 'already_authenticated':
          router.replace(config.redirects.authenticated);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (config.options.checkOnMount && !isInitialized) {
      handleRouteChange();
      setIsInitialized(true);
    }
  }, [user, loading, pathname]);

  useEffect(() => {
    if (config.options.checkOnRouteChange && isInitialized) {
      handleRouteChange();
    }
  }, [pathname]);

  return {
    user,
    loading,
    isInitialized,
    checkRouteAccess,
    handleRouteChange,
    isPublicRoute: isPublicRoute(pathname),
    isProtectedRoute: isProtectedRoute(pathname),
    requiredRole: getRequiredRole(pathname),
  };
}

/**
 * Higher-order component for client-side route protection
 */
export function withClientMiddleware(WrappedComponent, options = {}) {
  return function ClientMiddlewareComponent(props) {
    const middleware = useClientMiddleware(options);

    // Don't render if access is not allowed
    if (middleware.loading) {
      return null; // Or a loading component
    }

    const { allowed } = middleware.checkRouteAccess();
    if (!allowed) {
      return null;
    }

    return <WrappedComponent {...props} middleware={middleware} />;
  };
}
