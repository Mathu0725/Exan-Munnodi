'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Subjects', path: '/subjects', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Categories', path: '/categories', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Exam Types', path: '/exam-types', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Question Bank', path: '/questions', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Exams', path: '/exams', roles: ['Admin', 'Content Editor', 'Viewer'] },
    { name: 'Bulk Actions', path: '/bulk-actions', roles: ['Admin', 'Content Editor'] },
    { name: 'Users & Roles', path: '/users', roles: ['Admin'] },
    { name: 'Audit Logs', path: '/audit-logs', roles: ['Admin'] },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <Image
          src="/unicomtic-logo.png"
          alt="UnicomTIC logo"
          width={32}
          height={32}
          className="mr-2 rounded"
          priority
        />
        <h1 className="text-2xl font-bold">UnicomTIC Quiz</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {menuItems
            .filter((item) => !user || !item.roles || item.roles.includes(user.role))
            .map((item) => (
              <li key={item.name} className="mb-4">
                <Link href={item.path} className="hover:text-blue-300">
                  {item.name}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
