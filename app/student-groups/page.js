'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import Pagination from '@/components/shared/Pagination';
import Modal from '@/components/ui/Modal';
import AddStudentsToGroup from '@/components/admin/AddStudentsToGroup';
import { FaUserPlus, FaUsers, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const GroupCard = ({ group, onEdit, onDelete, onAddStudents }) => {
  const memberCount = group._count?.members || 0;
  const examCount = group._count?.examGroups || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: group.color || '#3B82F6' }}
          />
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAddStudents(group)}
            className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center"
          >
            <FaUserPlus className="mr-1" />
            Add Students
          </button>
          <button
            onClick={() => onEdit(group)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(group)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      {group.description && (
        <p className="text-gray-600 text-sm mb-4">{group.description}</p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex space-x-4">
          <span>👥 {memberCount} members</span>
          <span>📝 {examCount} exams</span>
        </div>
        <span className="text-xs">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const GroupForm = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    color: group?.color || '#3B82F6',
    memberIds: group?.members?.map(m => m.userId) || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Group Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-8 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="#3B82F6"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {group ? 'Update Group' : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

export default function StudentGroupsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 12, search: '' });
  const [modal, setModal] = useState({ isOpen: false, group: null, mode: 'create' });
  const [addStudentsModal, setAddStudentsModal] = useState({ isOpen: false, group: null });
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-groups', filters],
    queryFn: () => fetch(`/api/student-groups?${new URLSearchParams(filters)}`).then(res => res.json()),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch('/api/student-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-groups']);
      setModal({ isOpen: false, group: null, mode: 'create' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => fetch(`/api/student-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-groups']);
      setModal({ isOpen: false, group: null, mode: 'create' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/student-groups/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-groups']);
    },
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreate = () => {
    setModal({ isOpen: true, group: null, mode: 'create' });
  };

  const handleEdit = (group) => {
    setModal({ isOpen: true, group, mode: 'edit' });
  };

  const handleAddStudents = (group) => {
    setAddStudentsModal({ isOpen: true, group });
  };

  const handleDelete = (group) => {
    if (window.confirm(`Delete group "${group.name}"? This will remove all members and exam assignments.`)) {
      deleteMutation.mutate(group.id);
    }
  };

  const handleSave = (formData) => {
    if (modal.mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: modal.group.id, data: formData });
    }
  };

  const groups = data?.data || [];
  const meta = data?.meta;

  return (
    <PageWrapper title="Student Groups">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search groups..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        {user?.role !== 'Viewer' && (
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
          >
            <span className="mr-2">➕</span>
            Create Group
          </button>
        )}
      </div>

      {isLoading && <div className="text-center py-8">Loading groups...</div>}
      {error && <div className="text-center py-8 text-red-500">Error loading groups.</div>}
      
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddStudents={handleAddStudents}
              />
            ))}
          </div>
          
          {meta && (
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ isOpen: false, group: null, mode: 'create' })}
        title={modal.mode === 'create' ? 'Create Student Group' : 'Edit Student Group'}
      >
        <GroupForm
          group={modal.group}
          onSave={handleSave}
          onCancel={() => setModal({ isOpen: false, group: null, mode: 'create' })}
        />
      </Modal>

      {/* Add Students Modal */}
      {addStudentsModal.isOpen && (
        <AddStudentsToGroup
          group={addStudentsModal.group}
          onClose={() => setAddStudentsModal({ isOpen: false, group: null })}
        />
      )}
    </PageWrapper>
  );
}
