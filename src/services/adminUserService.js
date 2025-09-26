const toJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!isJson) return null;
  return response.json().catch(() => null);
};

const handleResponse = async (response) => {
  const payload = await toJson(response);
  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed');
    error.status = response.status;
    error.details = payload;
    throw error;
  }
  return payload;
};

export const adminUserService = {
  async list(params = {}) {
    const search = new URLSearchParams(params).toString();
    const response = await fetch(`/api/admin/users${search ? `?${search}` : ''}`);
    return handleResponse(response);
  },

  async create(data) {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update({ id, status, role, approvedById }) {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, role, approvedById }),
    });
    return handleResponse(response);
  },
};
