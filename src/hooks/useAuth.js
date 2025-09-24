'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Mock user service to get user details including role
const mockUserService = {
  getUserByEmail: async (email) => {
    // In a real app, this would be a fetch call to your backend
    await new Promise(resolve => setTimeout(resolve, 200));
    const nameFromEmail = (em) => {
      const local = em.split('@')[0] || '';
      // Convert kebab/underscore/dots to spaces and title-case
      const words = local.replace(/[._-]+/g, ' ').trim().split(/\s+/);
      return words
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || em;
    };

    if (email.startsWith('admin')) {
      return { email, role: 'Admin', name: 'Admin User' };
    }
    if (email.startsWith('editor')) {
      return { email, role: 'Content Editor', name: 'Editor User' };
    }
    if (email.startsWith('student')) {
      return { email, role: 'Student', name: 'Student User' };
    }
    return { email, role: 'Viewer', name: nameFromEmail(email) };
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userDetails = await mockUserService.getUserByEmail(token);
        setUser(userDetails);
        if (pathname === '/login') {
          router.replace('/');
        }
      } catch (e) {
        setUser(null);
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
    setLoading(false);
  }, [router, pathname]);

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [checkAuth]);

  const login = async (email) => {
    const userDetails = await mockUserService.getUserByEmail(email);
    localStorage.setItem('authToken', userDetails.email);
    setUser(userDetails);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };

  const value = { user, login, logout, loading };

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center">Loading...</div>; // Or a proper splash screen
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
