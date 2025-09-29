'use client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { startPresence, getOnlineCount } from '@/services/presenceService';
import { CompactThemeToggle } from '@/components/shared/ThemeToggle';

export default function Topbar({ title, onMenuToggle }) {
  const { user } = useAuth();
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const stop = startPresence(user?.email || 'anon');
    const t = setInterval(() => setOnline(getOnlineCount()), 5000);
    setOnline(getOnlineCount());
    return () => {
      stop();
      clearInterval(t);
    };
  }, [user?.email]);

  return (
    <header className='sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gunmetal-700 dark:bg-gunmetal-900/80 theme-transition'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={onMenuToggle}
            className='inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden dark:text-gunmetal-200 dark:hover:bg-gunmetal-800'
            aria-label='Open navigation'
          >
            <svg
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 14a1 1 0 100 2h12a1 1 0 100-2H4z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          <div>
            <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gunmetal-200'>
              Overview
            </p>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-midnight-50'>
              {title}
            </h2>
          </div>
        </div>
        <div className='flex items-center gap-3 text-sm'>
          <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gunmetal-800 dark:text-midnight-100'>
            <span className='h-2 w-2 rounded-full bg-green-500'></span>
            {online} online
          </span>
          {user && (
            <span className='hidden sm:inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gunmetal-800 dark:text-midnight-100'>
              <span className='h-6 w-6 rounded-full bg-midnight-500/20 text-midnight-600 dark:bg-midnight-500/30 dark:text-midnight-100 flex items-center justify-center text-xs font-semibold'>
                {(user.name || user.email)?.charAt(0).toUpperCase()}
              </span>
              <div className='flex flex-col'>
                <span className='font-medium leading-tight'>
                  {user.name || user.email}
                </span>
                <span className='text-xs text-gray-500 dark:text-gunmetal-200 capitalize'>
                  {user.role}
                </span>
              </div>
            </span>
          )}
          <CompactThemeToggle />
        </div>
      </div>
    </header>
  );
}
