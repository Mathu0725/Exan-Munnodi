'use client';

import { sessionManager } from '@/lib/session/sessionManager';

/**
 * Token refresh utility
 */
export class TokenRefreshManager {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.refreshCallbacks = [];
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const buffer = 300; // 5 minutes buffer

      return payload.exp < now + buffer;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      this._notifyRefreshCallbacks(null, result);
      return result;
    } catch (error) {
      this._notifyRefreshCallbacks(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  async _performRefresh() {
    const refreshToken = sessionManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Token refresh failed');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Update stored tokens
        sessionManager.setTokens(data.data.accessToken, data.data.refreshToken);
        sessionManager.updateTimestamp();

        return data.data;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      sessionManager.clearTokens();
      throw error;
    }
  }

  /**
   * Add callback to be called when token refresh completes
   */
  onRefresh(callback) {
    this.refreshCallbacks.push(callback);
  }

  /**
   * Remove refresh callback
   */
  offRefresh(callback) {
    this.refreshCallbacks = this.refreshCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all refresh callbacks
   */
  _notifyRefreshCallbacks(error, result) {
    this.refreshCallbacks.forEach(callback => {
      try {
        callback(error, result);
      } catch (err) {
        console.error('Error in refresh callback:', err);
      }
    });
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken() {
    const authToken = sessionManager.getAuthToken();

    if (!authToken || this.isTokenExpired(authToken)) {
      try {
        const refreshed = await this.refreshAccessToken();
        return refreshed.accessToken;
      } catch (error) {
        // If refresh fails, user needs to log in again
        throw new Error('Session expired. Please log in again.');
      }
    }

    return authToken;
  }

  /**
   * Check if refresh is in progress
   */
  isRefreshInProgress() {
    return this.isRefreshing;
  }
}

// Create singleton instance
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * API request interceptor with automatic token refresh
 */
export async function apiRequest(url, options = {}) {
  const { retryCount = 0, maxRetries = 1 } = options;

  try {
    // Get valid access token
    const accessToken = await tokenRefreshManager.getValidAccessToken();

    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized and we haven't retried yet, try to refresh token
    if (response.status === 401 && retryCount < maxRetries) {
      try {
        await tokenRefreshManager.refreshAccessToken();
        // Retry the request with new token
        return apiRequest(url, {
          ...options,
          retryCount: retryCount + 1,
          maxRetries,
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  } catch (error) {
    if (error.message.includes('Session expired')) {
      // Clear session and redirect to login
      sessionManager.clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
}

/**
 * Hook for automatic token refresh
 */
export function useTokenRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    const handleRefresh = (error, result) => {
      setIsRefreshing(false);
      if (result) {
        setLastRefresh(new Date());
      }
    };

    tokenRefreshManager.onRefresh(handleRefresh);

    return () => {
      tokenRefreshManager.offRefresh(handleRefresh);
    };
  }, []);

  const refreshToken = async () => {
    setIsRefreshing(true);
    try {
      const result = await tokenRefreshManager.refreshAccessToken();
      return result;
    } finally {
      setIsRefreshing(false);
    }
  };

  const getValidToken = async () => {
    return await tokenRefreshManager.getValidAccessToken();
  };

  return {
    isRefreshing,
    lastRefresh,
    refreshToken,
    getValidToken,
    isRefreshInProgress: tokenRefreshManager.isRefreshInProgress(),
  };
}

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react';
