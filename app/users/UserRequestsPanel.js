'use client';

import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';

export function UserRequestsPanel({ reviewerId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/profile/requests', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Failed to fetch profile requests');
        const payload = await response.json();
        if (!active) return;
        setRequests(payload.data || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load requests', err);
        if (!active) return;
        setError(err.message || 'Failed to load requests');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const handleReview = async (requestId, approve) => {
    setError(null);
    try {
      await profileService.reviewRequest({ requestId, reviewerId, approve });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('Failed to review request', err);
      setError(err.message || 'Failed to update request');
    }
  };

  if (loading) {
    return <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">Loading requests...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Profile Update Requests</h2>
        <p className="mt-2 text-sm text-gray-500">No pending requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <article key={request.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">Request #{request.id}</div>
              <div className="text-xs text-gray-500">User: {request.user?.name || request.userId}</div>
            </div>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pending</span>
          </header>

          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs text-gray-700">
            {JSON.stringify(JSON.parse(request.changes || '{}'), null, 2)}
          </pre>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleReview(request.id, true)}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
            >
              Approve
            </button>
            <button
              onClick={() => handleReview(request.id, false)}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

