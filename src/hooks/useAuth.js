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

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/reset-with-otp'];
const AuthContext = createContext(undefined);

const isAuthRoute = (pathname) => {
  if (!pathname) return false;
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await requestJson('/api/auth/me');
      setUser(data || null);
    } catch (error) {
      setUser(null);
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
      router.replace('/login');
    } else if (user && inAuthRoute) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(
    async ({ email, password }) => {
      setAuthLoading(true);
      try {
        const payload = await requestJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (payload.success) {
          await refreshUser();
          router.replace('/');
        }
        return payload;
      } finally {
        setAuthLoading(false);
      }
    },
    [router, refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await requestJson('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  const registerUser = useCallback(async (data) => {
    setAuthLoading(true);
    try {
      return await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async ({ email }) => {
    setAuthLoading(true);
    try {
      return await requestJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async ({ token, password, otp }) => {
    setAuthLoading(true);
    try {
      return await requestJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password, otp }),
      });
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
    [user, loading, authLoading, login, logout, registerUser, requestPasswordReset, resetPassword, refreshUser]
  );

  if (loading && !isAuthRoute(pathname)) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-sm text-gray-600">
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
