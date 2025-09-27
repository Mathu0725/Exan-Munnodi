'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const StaffMemberCard = ({ staff, onEdit, onDelete, onToggleStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Content Editor': return 'bg-blue-100 text-blue-800';
      case 'Reviewer': return 'bg-orange-100 text-orange-800';
      case 'Analyst': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <FaUserCheck className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
            <p className="text-sm text-gray-600">{staff.email}</p>
            {staff.institution && (
              <p className="text-xs text-gray-500">{staff.institution}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
            {staff.status}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(staff.role)}`}>
            {staff.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Phone:</span>
          <p>{staff.phone || 'Not provided'}</p>
        </div>
        <div>
          <span className="font-medium">Created:</span>
          <p>{new Date(staff.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onToggleStatus(staff)}
          className={`px-3 py-1 text-xs font-medium rounded-md ${
            staff.status === 'Active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {staff.status === 'Active' ? (
            <>
              <FaUserTimes className="mr-1" />
              Deactivate
            </>
          ) : (
            <>
              <FaUserCheck className="mr-1" />
              Activate
            </>
          )}
        </button>
        <button
          onClick={() => onEdit(staff)}
          className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
        >
          <FaEdit className="mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete(staff)}
          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
        >
          <FaTrash className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default function StaffManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  const { data: staffData, isLoading } = useQuery({
    queryKey: ['admin-staff', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/admin/staff?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load staff members');
      return res.json();
    },
    enabled: user?.role === 'Super Admin',
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ staffId, newStatus }) => {
      const res = await fetch(`/api/admin/staff/${staffId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-staff']);
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId) => {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete staff member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-staff']);
    },
  });

  const handleToggleStatus = (staff) => {
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} ${staff.name}?`)) {
      toggleStatusMutation.mutate({ staffId: staff.id, newStatus });
    }
  };

  const handleDelete = (staff) => {
    if (window.confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
      deleteStaffMutation.mutate(staff.id);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (!user || user.role !== 'Super Admin') {
    return (
      <PageWrapper title="Access Denied">
        <div className="text-center py-12">
          <p className="text-red-500">Only Super Admin can access staff management.</p>
        </div>
      </PageWrapper>
    );
  }

  const staff = staffData?.data || [];

  return (
    <PageWrapper title="Staff Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage admin staff members and their permissions</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FaUserPlus className="mr-2" />
            Create Staff Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Content Editor">Content Editor</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading staff members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <FaUserPlus className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No staff members found.</p>
            <p className="text-sm text-gray-400 mt-1">Create your first staff member to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((staffMember) => (
              <StaffMemberCard
                key={staffMember.id}
                staff={staffMember}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Create Staff Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="max-w-4xl w-full mx-4">
              <StaffCreationForm onClose={() => setShowCreateForm(false)} />
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
