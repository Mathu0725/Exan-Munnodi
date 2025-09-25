'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import MasterDataForm from './MasterDataForm';
import Pagination from '@/components/shared/Pagination';

export default function MasterDataPage({ pageTitle, itemType, service }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const queryKey = [itemType, page, limit, search];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => service.list({ page, limit, search }),
    keepPreviousData: true,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [itemType] });
      closeModal();
    },
  };

  const createMutation = useMutation({ mutationFn: service.create, ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: (vars) => service.update(vars.id, vars.data), ...mutationOptions });
  const deleteMutation = useMutation({ mutationFn: service.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: [itemType] }) });

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <PageWrapper title={pageTitle}>
      <div className="flex justify-end mb-4">
        {user?.role !== 'Viewer' && (
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Add {itemType}
          </button>
        )}
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error loading data.</p>}
      
      {data && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 flex items-center justify-between">
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder={`Search ${itemType}s...`}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user?.role !== 'Viewer' ? (
                      <>
                        <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </>
                    ) : (
                      <span className="text-gray-400">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && (
            <Pagination
              currentPage={data.meta.currentPage}
              totalPages={data.meta.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? `Edit ${itemType}` : `Add ${itemType}`}>
        <MasterDataForm item={editingItem} onSubmit={handleFormSubmit} onCancel={closeModal} />
      </Modal>
    </PageWrapper>
  );
}
