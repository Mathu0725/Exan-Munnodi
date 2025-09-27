'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Sidebar({ onNavigate, className = '', showCloseButton = false }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const handleNavigate = () => {
    if (typeof onNavigate === 'function') {
      onNavigate();
    }
  };

  const handleLogout = () => {
    logout();
    handleNavigate();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', roles: ['Admin', 'Content Editor', 'Reviewer', 'Analyst', 'Student'] },
    { name: 'Subjects', path: '/subjects', roles: ['Admin', 'Content Editor', 'Reviewer', 'Analyst'] },
    { name: 'Categories', path: '/categories', roles: ['Admin', 'Content Editor', 'Reviewer', 'Analyst'] },
    { name: 'Exam Types', path: '/exam-types', roles: ['Admin', 'Content Editor', 'Reviewer', 'Analyst'] },
    { name: 'Question Bank', path: '/questions', roles: ['Admin', 'Content Editor', 'Reviewer'] },
    { name: 'Exams', path: '/exams', roles: ['Admin', 'Content Editor', 'Reviewer'] },
    { name: 'Bulk Actions', path: '/bulk-actions', roles: ['Admin', 'Content Editor'] },
    { name: 'Question Cleanup', path: '/question-cleanup', roles: ['Admin', 'Content Editor'] },
    { name: 'Users & Roles', path: '/users', roles: ['Admin'] },
    { name: 'Audit Logs', path: '/audit-logs', roles: ['Admin'] },
    { name: 'Profile', path: '/profile', roles: ['Admin', 'Content Editor', 'Reviewer', 'Analyst', 'Student'] },
  ];

  return (
    <aside
      className={`w-full max-w-xs border-r border-gray-200 dark:border-gunmetal-700 bg-white text-gray-900 dark:bg-gunmetal-900 dark:text-midnight-100 px-5 py-6 flex flex-col gap-8 theme-transition ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src="/unicomtic-logo.png"
            alt="UnicomTIC logo"
            width={36}
            height={36}
            className="rounded"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold tracking-wide">UnicomTIC Quiz</h1>
            <p className="text-xs text-gray-500 dark:text-gunmetal-200">Admin Console</p>
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={handleNavigate}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gunmetal-200 dark:hover:bg-gunmetal-700 theme-transition"
            aria-label="Close navigation"
          >
            ×
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {(user?.role === 'Super Admin' ? menuItems : menuItems.filter((item) => !user || !item.roles || item.roles.includes(user.role)))
            .map((item) => {
              const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={handleNavigate}
                    className={`block rounded-md px-3 py-2 text-sm font-medium theme-transition ${
                      isActive
                        ? 'bg-midnight-500/10 text-midnight-600 dark:bg-midnight-500/30 dark:text-midnight-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gunmetal-200 dark:hover:bg-gunmetal-800 dark:hover:text-midnight-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gunmetal-200 dark:hover:bg-gunmetal-800 dark:hover:text-midnight-100 theme-transition"
      >
        Logout
      </button>
    </aside>
  );
}
