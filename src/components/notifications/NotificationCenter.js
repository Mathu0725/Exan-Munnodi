'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return '📢';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getTypeColor(notification.type)} ${
      !notification.isRead ? 'border-l-4 border-l-indigo-500' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          {notification.group && (
            <div className="flex items-center space-x-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: notification.group.color }}
              />
              <span className="text-xs text-gray-500">Group: {notification.group.name}</span>
            </div>
          )}
          
          {notification.exam && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Exam: {notification.exam.title}
                {notification.exam.startAt && (
                  <span> • Starts: {new Date(notification.exam.startAt).toLocaleString()}</span>
                )}
              </span>
            </div>
          )}
          
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all, unread, read

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id, filter],
    queryFn: () => {
      const params = new URLSearchParams({ userId: user.id });
      if (filter !== 'all') {
        params.set('isRead', filter === 'read');
      }
      return fetch(`/api/notifications?${params}`).then(res => res.json());
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds) => fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds, isRead: true }),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      const unreadIds = notifications?.filter(n => !n.isRead).map(n => n.id) || [];
      if (unreadIds.length === 0) return Promise.resolve();
      
      return fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds, isRead: true }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate([notificationId]);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'unread' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'read' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {notifications?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
