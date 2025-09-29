'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function PageWrapper({ children, title }) {
  const { user } = useAuth();
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isProfileRoute = useMemo(
    () => pathname.startsWith('/profile'),
    [pathname]
  );

  if (!user) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4'>
        <div className='max-w-md text-center'>
          <h2 className='text-xl font-semibold text-gray-900'>
            You are not logged in.
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Please{' '}
            <Link href='/login' className='text-indigo-600'>
              sign in
            </Link>{' '}
            to continue.
          </p>
        </div>
      </div>
    );
  }

  if (!isProfileRoute && user.status !== 'Active') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4'>
        <div className='max-w-md text-center space-y-3'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Account pending approval
          </h2>
          <p className='text-sm text-gray-600'>
            Your account is currently <strong>{user.status}</strong>.
            Administrators must approve your registration before you can access
            the system.
          </p>
          <p className='text-sm text-gray-500'>
            If this takes longer than expected, please contact the
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 theme-transition'>
      {/* Desktop sidebar */}
      <div className='hidden lg:flex lg:w-64 lg:flex-col'>
        <Sidebar />
      </div>

      {/* Mobile/Tablet overlay sidebar */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-40 flex lg:hidden'>
          <div
            className='fixed inset-0 bg-black/40'
            onClick={() => setSidebarOpen(false)}
            aria-hidden='true'
          ></div>
          <div className='relative z-50 w-72 max-w-[90%]'>
            <Sidebar showCloseButton onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className='flex-1 flex flex-col overflow-hidden'>
        <Topbar
          title={title}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />
        <div className='flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900'>
          <div className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
