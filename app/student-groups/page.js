'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PageWrapper from '@/components/layout/PageWrapper';
import Pagination from '@/components/shared/Pagination';
import Modal from '@/components/ui/Modal';
import AddStudentsToGroup from '@/components/admin/AddStudentsToGroup';
import GroupCard from '@/components/student-groups/GroupCard';
import GroupForm from '@/components/student-groups/GroupForm';

export default function StudentGroupsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 12, search: '' });
  const [modal, setModal] = useState({
    isOpen: false,
    group: null,
    mode: 'create',
  });
  const [addStudentsModal, setAddStudentsModal] = useState({
    isOpen: false,
    group: null,
  });
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-groups', filters],
    queryFn: () =>
      fetch(`/api/student-groups?${new URLSearchParams(filters)}`).then(res =>
        res.json()
      ),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: data =>
      fetch('/api/student-groups', {
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
    mutationFn: ({ id, data }) =>
      fetch(`/api/student-groups/${id}`, {
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
    mutationFn: id =>
      fetch(`/api/student-groups/${id}`, { method: 'DELETE' }).then(res =>
        res.json()
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-groups']);
    },
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, page: 1, [name]: value }));
  };

  const handlePageChange = page => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreate = () => {
    setModal({ isOpen: true, group: null, mode: 'create' });
  };

  const handleEdit = group => {
    setModal({ isOpen: true, group, mode: 'edit' });
  };

  const handleAddStudents = group => {
    setAddStudentsModal({ isOpen: true, group });
  };

  const handleDelete = group => {
    if (
      window.confirm(
        `Delete group "${group.name}"? This will remove all members and exam assignments.`
      )
    ) {
      deleteMutation.mutate(group.id);
    }
  };

  const handleSave = formData => {
    if (modal.mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: modal.group.id, data: formData });
    }
  };

  const groups = data?.data || [];
  const meta = data?.meta;

  return (
    <PageWrapper title='Student Groups'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-4'>
          <input
            type='text'
            placeholder='Search groups...'
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </div>

        {user?.role !== 'Viewer' && (
          <button
            onClick={handleCreate}
            className='px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center'
          >
            <span className='mr-2'>➕</span>
            Create Group
          </button>
        )}
      </div>

      {isLoading && <div className='text-center py-8'>Loading groups...</div>}
      {error && (
        <div className='text-center py-8 text-red-500'>
          Error loading groups.
        </div>
      )}

      {data && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {groups.map(group => (
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
        title={
          modal.mode === 'create'
            ? 'Create Student Group'
            : 'Edit Student Group'
        }
      >
        <GroupForm
          group={modal.group}
          onSave={handleSave}
          onCancel={() =>
            setModal({ isOpen: false, group: null, mode: 'create' })
          }
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
