'use client';

/**
 * Session management utilities
 */
export class SessionManager {
  constructor() {
    this.storageKey = 'session_data';
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.userKey = 'user_data';
  }

  /**
   * Store session data
   */
  setSession(sessionData) {
    try {
      const data = {
        ...sessionData,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store session data:', error);
    }
  }

  /**
   * Get session data
   */
  getSession() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve session data:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return sessionAge < maxAge;
  }

  /**
   * Store user data
   */
  setUser(userData) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get user data
   */
  getUser() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Store tokens
   */
  setTokens(authToken, refreshToken) {
    try {
      if (authToken) {
        localStorage.setItem(this.tokenKey, authToken);
      }
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const authToken = this.getAuthToken();
    const user = this.getUser();
    return !!(authToken && user);
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    const session = this.getSession();
    const user = this.getUser();
    const authToken = this.getAuthToken();
    const refreshToken = this.getRefreshToken();

    return {
      session,
      user,
      authToken,
      refreshToken,
      isAuthenticated: this.isAuthenticated(),
      isValid: this.isSessionValid(),
    };
  }

  /**
   * Update session timestamp
   */
  updateTimestamp() {
    const session = this.getSession();
    if (session) {
      session.timestamp = Date.now();
      this.setSession(session);
    }
  }

  /**
   * Check if session is about to expire
   */
  isSessionExpiringSoon(warningMinutes = 5) {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const warningTime = warningMinutes * 60 * 1000;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return maxAge - sessionAge < warningTime;
  }

  /**
   * Get session time remaining in minutes
   */
  getSessionTimeRemaining() {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const remaining = maxAge - sessionAge;

    return Math.max(0, Math.floor(remaining / (60 * 1000))); // Convert to minutes
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Export convenience functions
export const {
  setSession,
  getSession,
  clearSession,
  isSessionValid,
  setUser,
  getUser,
  setTokens,
  getAuthToken,
  getRefreshToken,
  clearTokens,
  isAuthenticated,
  getSessionInfo,
  updateTimestamp,
  isSessionExpiringSoon,
  getSessionTimeRemaining,
} = sessionManager;
