'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import withRole from '@/components/auth/withRole';
import { adminUserService } from '@/services/adminUserService';
import { USER_ROLES, USER_STATUSES } from '@/constants/users';
import { useAuth } from '@/hooks/useAuth';
import { UserRequestsPanel } from './UserRequestsPanel';

function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState('Pending');
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', text: string }

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', statusFilter],
    queryFn: () => adminUserService.list(statusFilter ? { status: statusFilter } : undefined),
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      closeModal();
    },
  };

  const updateMutation = useMutation({
    mutationFn: adminUserService.update,
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
  });

  const handleAction = (user, action) => {
    const statusMap = {
      approve: 'Approved',
      reject: 'Rejected',
      suspend: 'Suspended',
    };

    updateMutation.mutate(
      {
        id: user.id,
        status: statusMap[action],
        approvedById: action === 'approve' ? currentUser?.id : undefined,
      },
      {
        onSuccess: () => {
          const verb = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended';
          setBanner({ type: 'success', text: `User ${verb} successfully.` });
        },
        onError: (err) => {
          setBanner({ type: 'error', text: err?.message || 'Failed to update user.' });
        },
      }
    );
  };

  const users = data?.data || [];
  const pendingCount = users.filter((u) => u.status === 'Pending').length;
  const hasPending = pendingCount > 0;

  const statusOptions = useMemo(() => ['All', ...USER_STATUSES], []);

  return (
    <PageWrapper title="Users & Roles">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600">
            Manage user approvals, roles, and account status. Pending registrations require approval.
          </p>
          {hasPending && (
            <p className="mt-1 text-sm font-medium text-yellow-700">
              {pendingCount} pending {pendingCount === 1 ? 'user' : 'users'} awaiting approval.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === 'All' ? '' : e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status === 'All' ? 'All' : status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {banner && (
        <div
          role="alert"
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            banner.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {banner.text}
        </div>
      )}

      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error loading users.</p>}
      
      {users.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        user.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.approvedBy?.name || user.approvedById ? 'Admin' : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleAction(user, 'approve')}
                      className="text-green-600 hover:text-green-900 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.status === 'Approved'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(user, 'reject')}
                      className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.status === 'Rejected'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(user, 'suspend')}
                      className="text-orange-600 hover:text-orange-900 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.status === 'Suspended'}
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          No users found.
        </div>
      )}

      <div className="mt-8">
        <UserRequestsPanel reviewerId={currentUser?.id} />
      </div>
    </PageWrapper>
  );
}

export default withRole(UsersPage, ['Admin']);
