'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Categories', path: '/categories' },
    { name: 'Exam Types', path: '/exam-types' },
    { name: 'Question Bank', path: '/questions' },
    { name: 'Exams', path: '/exams' },
    { name: 'Bulk Actions', path: '/bulk-actions' },
    { name: 'Users & Roles', path: '/users' },
    { name: 'Audit Logs', path: '/audit-logs' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Exam Munnodi</h1>
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
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
