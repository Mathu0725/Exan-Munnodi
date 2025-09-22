'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setUser({ email: token }); // In real app, decode token or fetch user
      if (pathname === '/login') {
        router.replace('/');
      }
    } else {
      setUser(null);
      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, [router, pathname]);

  useEffect(() => {
    checkAuth();
    // Listen for storage changes to sync across tabs
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  const login = (email) => {
    // Mock token, in real app this comes from API
    localStorage.setItem('authToken', email);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = { user, login, logout };

  if (!user && pathname !== '/login') {
    return null; // or a loading spinner
  }

  if (user && pathname === '/login') {
    return null; // or a loading spinner
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
