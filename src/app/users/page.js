'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import { userService } from '@/services/userService';
import Modal from '@/components/ui/Modal';
import UserForm from '@/components/users/UserForm';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      closeModal();
    },
  };

  const createMutation = useMutation({ mutationFn: userService.createUser, ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: (vars) => userService.updateUser(vars.id, vars.data), ...mutationOptions });
  const deleteMutation = useMutation({ mutationFn: userService.deleteUser, onSuccess: () => queryClient.invalidateQueries(['users']) });

  const openModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <PageWrapper title="Users & Roles">
      <div className="flex justify-end mb-4">
        <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Add User
        </button>
      </div>

      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error loading users.</p>}
      
      {data && (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit User' : 'Add User'}>
        <UserForm user={editingUser} onSubmit={handleFormSubmit} onCancel={closeModal} />
      </Modal>
    </PageWrapper>
  );
}
