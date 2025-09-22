'use client';
import { useAuth } from '@/hooks/useAuth';

export default function Topbar({ title }) {
  const { user } = useAuth();
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {user && <div className="text-sm">Logged in as: {user.email}</div>}
    </header>
  );
}
