"use client";

import { AuthProvider } from '@/hooks/useAuth';

export default function SessionProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
