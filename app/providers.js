'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/components/ui/NotificationContainer';
import { ToastProvider } from '@/components/ui/ToastContainer';
import TokenRefreshProvider from '@/components/auth/TokenRefreshProvider';
import SessionProvider from '@/components/auth/SessionProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            <SessionProvider>
              <TokenRefreshProvider>{children}</TokenRefreshProvider>
            </SessionProvider>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
