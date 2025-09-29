'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/apiClient';
import { sessionManager } from '@/lib/session/sessionManager';

const AUTH_ROUTES = [
  '/login',
  '/login-3d',
  '/register',
  '/forgot-password',
  '/forgot-password-3d',
  '/reset-password',
  '/reset-with-otp',
];
const AuthContext = createContext(undefined);

const isAuthRoute = pathname => {
  if (!pathname) return false;
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
};

// Remove the old requestJson function as we're using the new API client

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      const userData = response.data || response;
      setUser(userData || null);

      // Update session manager
      if (userData) {
        sessionManager.setUser(userData);
        sessionManager.updateTimestamp();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      sessionManager.clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (loading) return;

    const inAuthRoute = isAuthRoute(pathname);
    if (!user && !inAuthRoute) {
      router.replace('/login-3d');
    } else if (user && inAuthRoute) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(
    async ({ email, password }) => {
      setAuthLoading(true);
      try {
        const response = await authApi.login({ email, password });

        if (response.success) {
          // Store tokens if provided
          if (response.data?.accessToken) {
            sessionManager.setTokens(
              response.data.accessToken,
              response.data.refreshToken
            );
          }

          await refreshUser();
          router.replace('/');
        }

        return response;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [router, refreshUser]
  );

  const logout = useCallback(
    async (showMessage = true) => {
      try {
        await authApi.logout();
        if (showMessage) {
          // Show success message if notifications are available
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('success', 'Logged out successfully');
          }
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear user state even if logout request fails
      } finally {
        setUser(null);
        sessionManager.clearSession();
        router.replace('/login');
      }
    },
    [router]
  );

  const registerUser = useCallback(async data => {
    setAuthLoading(true);
    try {
      return await authApi.register(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async ({ email }) => {
    setAuthLoading(true);
    try {
      return await authApi.forgotPassword(email);
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async ({ token, password, otp }) => {
    setAuthLoading(true);
    try {
      return await authApi.resetPassword({ token, password, otp });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authLoading,
      login,
      logout,
      registerUser,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    }),
    [
      user,
      loading,
      authLoading,
      login,
      logout,
      registerUser,
      requestPasswordReset,
      resetPassword,
      refreshUser,
    ]
  );

  if (loading && !isAuthRoute(pathname)) {
    return (
      <div className='w-screen h-screen flex items-center justify-center text-sm text-gray-600'>
        Checking authentication...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
