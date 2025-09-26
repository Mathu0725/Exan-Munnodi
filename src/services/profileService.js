const handleResponse = async (response) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.details = payload;
    throw error;
  }
  return payload;
};

export const profileService = {
  async getProfile(userId) {
    const response = await fetch(`/api/profile?id=${userId}`, { cache: 'no-store' });
    return handleResponse(response);
  },

  async submitUpdate({ userId, changes, comment }) {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, changes, comment }),
    });
    return handleResponse(response);
  },

  async reviewRequest({ requestId, reviewerId, approve, comment }) {
    const response = await fetch(`/api/profile/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, approve, comment }),
    });
    return handleResponse(response);
  },
};

