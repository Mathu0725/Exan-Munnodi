'use client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { startPresence, getOnlineCount } from '@/services/presenceService';
import { CompactThemeToggle } from '@/components/shared/ThemeToggle';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const stop = startPresence(user?.email || 'anon');
    const t = setInterval(() => setOnline(getOnlineCount()), 5000);
    setOnline(getOnlineCount());
    return () => { stop(); clearInterval(t); };
  }, [user?.email]);
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center theme-transition">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Online: {online}</span>
        {user && <span className="text-gray-700 dark:text-gray-300">Logged in as: {user.name || user.email}</span>}
        <CompactThemeToggle />
      </div>
    </header>
  );
}
