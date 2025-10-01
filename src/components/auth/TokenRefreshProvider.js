'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tokenRefreshManager } from '@/lib/auth/tokenRefresh';
import { sessionManager } from '@/lib/session/sessionManager';

/**
 * Token refresh provider component
 * Handles automatic token refresh in the background
 */
export default function TokenRefreshProvider({ children }) {
  const { user, logout } = useAuth();

  const handleTokenRefresh = useCallback(
    (error, result) => {
      if (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, user needs to log in again
        logout(false); // Don't show logout message
      } else if (result) {
        console.log('Token refreshed successfully');
      }
    },
    [logout]
  );

  useEffect(() => {
    // Set up token refresh callbacks
    tokenRefreshManager.onRefresh(handleTokenRefresh);

    // Set up periodic token refresh check
    const checkInterval = setInterval(() => {
      if (user && sessionManager.isAuthenticated()) {
        const authToken = sessionManager.getAuthToken();
        if (authToken && tokenRefreshManager.isTokenExpired(authToken)) {
          // Token is expired, try to refresh
          tokenRefreshManager.refreshAccessToken().catch(error => {
            console.error('Automatic token refresh failed:', error);
            logout(false);
          });
        }
      }
    }, 60000); // Check every minute

    return () => {
      tokenRefreshManager.offRefresh(handleTokenRefresh);
      clearInterval(checkInterval);
    };
  }, [user, handleTokenRefresh, logout]);

  // Set up visibility change handler to refresh token when user becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && sessionManager.isAuthenticated()) {
        const authToken = sessionManager.getAuthToken();
        if (authToken && tokenRefreshManager.isTokenExpired(authToken)) {
          tokenRefreshManager.refreshAccessToken().catch(error => {
            console.error('Token refresh on visibility change failed:', error);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return <>{children}</>;
}

/**
 * Hook for manual token refresh
 */
export function useTokenRefresh() {
  const { logout } = useAuth();

  const refreshToken = useCallback(async () => {
    try {
      const result = await tokenRefreshManager.refreshAccessToken();
      return result;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      logout(false);
      throw error;
    }
  }, [logout]);

  const getValidToken = useCallback(async () => {
    try {
      return await tokenRefreshManager.getValidAccessToken();
    } catch (error) {
      console.error('Failed to get valid token:', error);
      logout(false);
      throw error;
    }
  }, [logout]);

  return {
    refreshToken,
    getValidToken,
    isRefreshInProgress: tokenRefreshManager.isRefreshInProgress(),
  };
}
