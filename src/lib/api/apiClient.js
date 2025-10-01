'use client';

import { apiRequest } from '@/lib/auth/tokenRefresh';
import { sessionManager } from '@/lib/session/sessionManager';

/**
 * API client with automatic token refresh
 */
export class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Get full URL
   */
  getUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Make API request with automatic token refresh
   */
  async request(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await apiRequest(url, config);

      // Handle different response types
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return data;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload file
   */
  async upload(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    });
  }

  /**
   * Download file
   */
  async download(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      method: 'GET',
      ...options,
    });

    if (response instanceof Response) {
      return response;
    } else {
      throw new Error('Invalid response for download');
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export convenience methods
export const {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  download,
  request,
} = apiClient;

/**
 * Auth API methods
 */
export const authApi = {
  login: credentials => apiClient.post('/api/auth/login', credentials),
  register: userData => apiClient.post('/api/auth/register', userData),
  logout: () => apiClient.post('/api/auth/logout'),
  refresh: refreshToken =>
    apiClient.post('/api/auth/refresh', { refreshToken }),
  me: () => apiClient.get('/api/auth/me'),
  forgotPassword: email =>
    apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: data => apiClient.post('/api/auth/reset-password', data),
  changePassword: data => apiClient.post('/api/auth/change-password', data),
};

/**
 * User API methods
 */
export const userApi = {
  getUsers: params => apiClient.get('/api/users', { params }),
  getUser: id => apiClient.get(`/api/users/${id}`),
  createUser: userData => apiClient.post('/api/users', userData),
  updateUser: (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  deleteUser: id => apiClient.delete(`/api/users/${id}`),
  approveUser: id => apiClient.post(`/api/users/${id}/approve`),
  rejectUser: id => apiClient.post(`/api/users/${id}/reject`),
};

/**
 * Exam API methods
 */
export const examApi = {
  getExams: params => apiClient.get('/api/exams', { params }),
  getExam: id => apiClient.get(`/api/exams/${id}`),
  createExam: examData => apiClient.post('/api/exams', examData),
  updateExam: (id, examData) => apiClient.put(`/api/exams/${id}`, examData),
  deleteExam: id => apiClient.delete(`/api/exams/${id}`),
  startExam: id => apiClient.post(`/api/exams/${id}/start`),
  submitExam: (id, answers) =>
    apiClient.post(`/api/exams/${id}/submit`, { answers }),
  getExamResults: id => apiClient.get(`/api/exams/${id}/results`),
};

/**
 * Question API methods
 */
export const questionApi = {
  getQuestions: params => apiClient.get('/api/questions', { params }),
  getQuestion: id => apiClient.get(`/api/questions/${id}`),
  createQuestion: questionData =>
    apiClient.post('/api/questions', questionData),
  updateQuestion: (id, questionData) =>
    apiClient.put(`/api/questions/${id}`, questionData),
  deleteQuestion: id => apiClient.delete(`/api/questions/${id}`),
  bulkCreate: questions => apiClient.post('/api/questions/bulk', { questions }),
  bulkUpdate: questions => apiClient.put('/api/questions/bulk', { questions }),
  bulkDelete: ids =>
    apiClient.delete('/api/questions/bulk', { body: JSON.stringify({ ids }) }),
};

/**
 * Subject API methods
 */
export const subjectApi = {
  getSubjects: params => apiClient.get('/api/subjects', { params }),
  getSubject: id => apiClient.get(`/api/subjects/${id}`),
  createSubject: subjectData => apiClient.post('/api/subjects', subjectData),
  updateSubject: (id, subjectData) =>
    apiClient.put(`/api/subjects/${id}`, subjectData),
  deleteSubject: id => apiClient.delete(`/api/subjects/${id}`),
};

/**
 * Category API methods
 */
export const categoryApi = {
  getCategories: params => apiClient.get('/api/categories', { params }),
  getCategory: id => apiClient.get(`/api/categories/${id}`),
  createCategory: categoryData =>
    apiClient.post('/api/categories', categoryData),
  updateCategory: (id, categoryData) =>
    apiClient.put(`/api/categories/${id}`, categoryData),
  deleteCategory: id => apiClient.delete(`/api/categories/${id}`),
};

/**
 * Student Group API methods
 */
export const studentGroupApi = {
  getGroups: params => apiClient.get('/api/student-groups', { params }),
  getGroup: id => apiClient.get(`/api/student-groups/${id}`),
  createGroup: groupData => apiClient.post('/api/student-groups', groupData),
  updateGroup: (id, groupData) =>
    apiClient.put(`/api/student-groups/${id}`, groupData),
  deleteGroup: id => apiClient.delete(`/api/student-groups/${id}`),
  addStudents: (id, studentIds) =>
    apiClient.post(`/api/student-groups/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) =>
    apiClient.delete(`/api/student-groups/${id}/students/${studentId}`),
};

/**
 * Profile API methods
 */
export const profileApi = {
  getProfile: () => apiClient.get('/api/profile'),
  updateProfile: profileData => apiClient.put('/api/profile', profileData),
  changePassword: passwordData =>
    apiClient.post('/api/profile/change-password', passwordData),
  uploadAvatar: file => apiClient.upload('/api/profile/avatar', file),
};

/**
 * Admin API methods
 */
export const adminApi = {
  getStats: () => apiClient.get('/api/admin/stats'),
  getUsers: params => apiClient.get('/api/admin/users', { params }),
  createStaff: staffData =>
    apiClient.post('/api/admin/create-staff', staffData),
  getAuditLogs: params => apiClient.get('/api/admin/audit-logs', { params }),
  getReports: params => apiClient.get('/api/admin/reports', { params }),
  bulkAction: (action, data) =>
    apiClient.post('/api/admin/bulk-action', { action, data }),
};
