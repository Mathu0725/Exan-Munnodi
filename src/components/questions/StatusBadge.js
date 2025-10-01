'use client';

export default function StatusBadge({ status }) {
  const baseClasses =
    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  const statusClasses = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`${baseClasses} ${statusClasses[status] || statusClasses.archived}`}
    >
      {status}
    </span>
  );
}
