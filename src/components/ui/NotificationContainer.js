'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import Notification from './Notification';

const NotificationContext = createContext(undefined);

/**
 * Notification container and context provider
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(notification => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback(id => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: 'success',
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: 'error',
        message,
        duration: 0, // Don't auto-dismiss errors
        ...options,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: 'warning',
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: 'info',
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Render notifications */}
      <div className='fixed inset-0 pointer-events-none z-50'>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}

export default NotificationProvider;
