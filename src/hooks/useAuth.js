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

const AUTH_STORAGE_KEY = 'authUser';
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const AuthContext = createContext(undefined);

const isAuthRoute = (pathname) => {
  if (!pathname) return false;
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    // Ignore JSON parsing errors for empty bodies
  }

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    const error = new Error(message);
    error.details = payload;
    error.status = response.status;
    throw error;
  }

  return payload;
}

function storeUser(user) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse stored auth user', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    const stored = readStoredUser();
    if (!stored?.id && !stored?.email) {
      storeUser(null);
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const param = stored.id
        ? `id=${stored.id}`
        : `email=${encodeURIComponent(stored.email)}`;
      const result = await requestJson(`/api/auth/user-info?${param}`, {
        method: 'GET',
      });

      if (result?.data) {
        setUser(result.data);
        storeUser(result.data);
        setLoading(false);
        return result.data;
      }

      storeUser(null);
      setUser(null);
      setLoading(false);
      return null;
    } catch (error) {
      console.error('Failed to refresh user session', error);
      storeUser(null);
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    refreshUser();

    const handleStorage = (event) => {
      if (event.key === AUTH_STORAGE_KEY) {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

        if (payload?.data) {
          setUser(payload.data);
          storeUser(payload.data);
          router.replace('/');
        }

        return payload;
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    storeUser(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const registerUser = useCallback(async (data) => {
    setAuthLoading(true);
    try {
      const payload = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return payload;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async ({ email }) => {
    setAuthLoading(true);
    try {
      const payload = await requestJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return payload;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async ({ token, password }) => {
    setAuthLoading(true);
    try {
      const payload = await requestJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      return payload;
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
    [user, loading, authLoading, login, logout, registerUser, requestPasswordReset, resetPassword, refreshUser],
  );

  if (loading) {
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
