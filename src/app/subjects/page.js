'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import { subjectService } from '@/services/subjectService';
import Modal from '@/components/ui/Modal';
import SubjectForm from '@/components/subjects/SubjectForm';
import SubSubjectForm from '@/components/subjects/SubSubjectForm';

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, subject: null });
  const [subSubjectModal, setSubSubjectModal] = useState({ isOpen: false, subSubject: null, subjectId: null });

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjectsWithSubsubjects'],
    queryFn: subjectService.getSubjectsWithSubsubjects,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries(['subjectsWithSubsubjects']);
  };

  // Subject Mutations
  const createSubjectMutation = useMutation({ mutationFn: subjectService.createSubject, onSuccess: () => { invalidateQueries(); closeSubjectModal(); } });
  const updateSubjectMutation = useMutation({ mutationFn: (vars) => subjectService.updateSubject(vars.id, vars.data), onSuccess: () => { invalidateQueries(); closeSubjectModal(); } });
  const deleteSubjectMutation = useMutation({ mutationFn: subjectService.deleteSubject, onSuccess: invalidateQueries });

  // Sub-subject Mutations
  const createSubSubjectMutation = useMutation({ mutationFn: subjectService.createSubSubject, onSuccess: () => { invalidateQueries(); closeSubSubjectModal(); } });
  const updateSubSubjectMutation = useMutation({ mutationFn: (vars) => subjectService.updateSubSubject(vars.id, vars.data), onSuccess: () => { invalidateQueries(); closeSubSubjectModal(); } });
  const deleteSubSubjectMutation = useMutation({ mutationFn: subjectService.deleteSubSubject, onSuccess: invalidateQueries });

  // Modal handlers
  const openSubjectModal = (subject = null) => setSubjectModal({ isOpen: true, subject });
  const closeSubjectModal = () => setSubjectModal({ isOpen: false, subject: null });
  const openSubSubjectModal = (subSubject = null, subjectId) => setSubSubjectModal({ isOpen: true, subSubject, subjectId });
  const closeSubSubjectModal = () => setSubSubjectModal({ isOpen: false, subSubject: null, subjectId: null });

  // Form submit handlers
  const handleSubjectSubmit = (formData) => {
    if (subjectModal.subject) {
      updateSubjectMutation.mutate({ id: subjectModal.subject.id, data: formData });
    } else {
      createSubjectMutation.mutate(formData);
    }
  };

  const handleSubSubjectSubmit = (formData) => {
    if (subSubjectModal.subSubject) {
      updateSubSubjectMutation.mutate({ id: subSubjectModal.subSubject.id, data: formData });
    } else {
      createSubSubjectMutation.mutate(formData);
    }
  };

  const handleDelete = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'subject') deleteSubjectMutation.mutate(id);
      if (type === 'sub-subject') deleteSubSubjectMutation.mutate(id);
    }
  };

  return (
    <PageWrapper title="Subjects & Sub-subjects">
      <div className="flex justify-end mb-4">
        <button onClick={() => openSubjectModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Add Subject
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error loading data.</p>}
      
      {data && (
        <div className="space-y-4">
          {data.data.map((subject) => (
            <div key={subject.id} className="bg-white shadow rounded-lg">
              <div className="p-4 flex justify-between items-center border-b">
                <div>
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subject.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {subject.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  <button onClick={() => openSubjectModal(subject)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete('subject', subject.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-600">Sub-subjects</h4>
                  <button onClick={() => openSubSubjectModal(null, subject.id)} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Sub-subject</button>
                </div>
                {subject.subsubjects.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {subject.subsubjects.map(ss => (
                      <li key={ss.id} className="py-2 flex justify-between items-center">
                        <span>{ss.name}</span>
                        <div className="text-sm">
                          <button onClick={() => openSubSubjectModal(ss, subject.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                          <button onClick={() => handleDelete('sub-subject', ss.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No sub-subjects yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={subjectModal.isOpen} onClose={closeSubjectModal} title={subjectModal.subject ? 'Edit Subject' : 'Add Subject'}>
        <SubjectForm subject={subjectModal.subject} onSubmit={handleSubjectSubmit} onCancel={closeSubjectModal} />
      </Modal>

      <Modal isOpen={subSubjectModal.isOpen} onClose={closeSubSubjectModal} title={subSubjectModal.subSubject ? 'Edit Sub-subject' : 'Add Sub-subject'}>
        <SubSubjectForm subSubject={subSubjectModal.subSubject} subjectId={subSubjectModal.subjectId} onSubmit={handleSubSubjectSubmit} onCancel={closeSubSubjectModal} />
      </Modal>
    </PageWrapper>
  );
}
