'use client';

import { useAuth } from '@/hooks/useAuth';
import AccessDenied from './AccessDenied';

const withRole = (Component, allowedRoles) => {
  return function WrappedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="w-screen h-screen flex items-center justify-center">Loading authentication...</div>;
    }

    // If user is not logged in, AuthProvider should handle redirect to /login
    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <AccessDenied />;
    }

    return <Component {...props} />;
  };
};

export default withRole;
