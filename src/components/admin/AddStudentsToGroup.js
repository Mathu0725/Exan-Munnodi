'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserPlus, FaTimes, FaSearch, FaUsers } from 'react-icons/fa';

const AddStudentsToGroup = ({ group, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Fetch available students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['available-students', group.id, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: '20'
      });
      const res = await fetch(`/api/student-groups/${group.id}/available-students?${params}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
  });

  // Add students mutation
  const addStudentsMutation = useMutation({
    mutationFn: async (studentIds) => {
      const res = await fetch(`/api/student-groups/${group.id}/add-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add students');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-groups']);
      queryClient.invalidateQueries(['available-students']);
      onClose();
      alert('Students added to group successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const allStudentIds = studentsData?.data?.map(student => student.id) || [];
    setSelectedStudents(allStudentIds);
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  const handleAddStudents = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    addStudentsMutation.mutate(selectedStudents);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUserPlus className="mr-2" />
            Add Students to "{group.name}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="mb-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or institution..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <FaUsers className="inline mr-1" />
                {selectedStudents.length} student(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading students...</p>
            </div>
          ) : studentsData?.data?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaUsers className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>No students found</p>
              {search && <p className="text-sm">Try adjusting your search terms</p>}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {studentsData?.data?.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {student.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      {student.institution && (
                        <p className="text-xs text-gray-500">{student.institution}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {studentsData?.meta && studentsData.meta.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {page} of {studentsData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(studentsData.meta.totalPages, p + 1))}
                disabled={page === studentsData.meta.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddStudents}
            disabled={selectedStudents.length === 0 || addStudentsMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addStudentsMutation.isPending ? 'Adding...' : `Add ${selectedStudents.length} Student(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentsToGroup;
