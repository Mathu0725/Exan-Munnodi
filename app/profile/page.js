'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PhotoUpload from '@/components/profile/PhotoUpload';

const EMPTY_PROFILE = {
  avatarUrl: '',
  bio: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  phone: '',
  institution: '',
};

function mergeProfile(user, profile) {
  const base = {
    ...EMPTY_PROFILE,
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    institution: user?.institution ?? '',
  };

  if (!profile) return base;

  return {
    ...base,
    avatarUrl: profile.avatarUrl ?? '',
    bio: profile.bio ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    country: profile.country ?? '',
    postalCode: profile.postalCode ?? '',
  };
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [formState, setFormState] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const canEdit = useMemo(() => !!user, [user]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/profile?id=${user.id}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const payload = await res.json();
        if (!active) return;

        setProfile(payload.data.profile);
        setUpdateRequests(payload.data.updateRequests || []);
        setFormState(mergeProfile(payload.data.user, payload.data.profile));
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Profile load failed', err);
        if (!active) return;
        setError(err.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [user]);

  const pendingRequest = useMemo(
    () => updateRequests.find(req => req.status === 'Pending'),
    [updateRequests]
  );

  const handleChange = event => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const changes = {};
    Object.entries(formState).forEach(([key, value]) => {
      if (value !== (profile?.[key] ?? user?.[key] ?? '')) {
        changes[key] = value;
      }
    });

    if (Object.keys(changes).length === 0) {
      setError('No changes to submit');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          changes,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to submit request');
      }

      setSuccess('Profile update submitted for approval');
      const payload = await res.json();
      setUpdateRequests(prev => [payload.data, ...prev]);
    } catch (err) {
      console.error('Submit failed', err);
      setError(err.message || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className='p-6'>
        <h1 className='text-lg font-semibold'>Profile</h1>
        <p className='text-sm text-gray-600 mt-2'>
          You must be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Profile</h1>
        <p className='text-sm text-gray-600 mt-1'>
          View your account details and request updates. Changes must be
          approved by an administrator.
        </p>
      </div>

      {error && (
        <div className='rounded-md border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm'>
          {error}
        </div>
      )}

      {success && (
        <div className='rounded-md border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm'>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Photo Upload Section */}
        <div className='flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg'>
          <h3 className='text-lg font-medium text-gray-900'>Profile Photo</h3>
          <PhotoUpload
            currentAvatar={formState.avatarUrl}
            onPhotoChange={avatarUrl =>
              setFormState(prev => ({ ...prev, avatarUrl }))
            }
            disabled={!canEdit || pendingRequest || submitting}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700' htmlFor='name'>
              Full Name
            </label>
            <input
              id='name'
              name='name'
              value={formState.name}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='email'
            >
              Email
            </label>
            <input
              id='email'
              name='email'
              value={formState.email}
              disabled
              className='rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='phone'
            >
              Phone
            </label>
            <input
              id='phone'
              name='phone'
              value={formState.phone}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='institution'
            >
              Institution
            </label>
            <input
              id='institution'
              name='institution'
              value={formState.institution}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-medium text-gray-700' htmlFor='bio'>
            Bio
          </label>
          <textarea
            id='bio'
            name='bio'
            value={formState.bio}
            onChange={handleChange}
            disabled={!canEdit || pendingRequest || submitting}
            rows={3}
            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='address'
            >
              Address
            </label>
            <input
              id='address'
              name='address'
              value={formState.address}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700' htmlFor='city'>
              City
            </label>
            <input
              id='city'
              name='city'
              value={formState.city}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='state'
            >
              State / Province
            </label>
            <input
              id='state'
              name='state'
              value={formState.state}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='country'
            >
              Country
            </label>
            <input
              id='country'
              name='country'
              value={formState.country}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='postalCode'
            >
              Postal Code
            </label>
            <input
              id='postalCode'
              name='postalCode'
              value={formState.postalCode}
              onChange={handleChange}
              disabled={!canEdit || pendingRequest || submitting}
              className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200 disabled:bg-gray-100'
            />
          </div>
        </div>

        <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
          {pendingRequest ? (
            <p className='text-sm text-gray-600'>
              You have a pending update request. Please wait for an
              administrator to review it.
            </p>
          ) : (
            <p className='text-sm text-gray-500'>
              Changes require administrator approval before they take effect.
            </p>
          )}

          <button
            type='submit'
            disabled={!canEdit || pendingRequest || submitting}
            className='inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            {submitting
              ? 'Submitting...'
              : pendingRequest
                ? 'Pending Approval'
                : 'Submit for Approval'}
          </button>
        </div>
      </form>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Update History</h2>

        {updateRequests.length === 0 ? (
          <p className='text-sm text-gray-500'>No update requests yet.</p>
        ) : (
          <div className='space-y-3'>
            {updateRequests.map(request => (
              <article
                key={request.id}
                className='rounded-md border border-gray-200 bg-white p-4 shadow-sm'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='text-sm font-medium text-gray-800'>
                    Request #{request.id}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      request.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className='mt-2 text-xs text-gray-500'>
                  Submitted {new Date(request.createdAt).toLocaleString()}
                  {request.reviewedAt &&
                    ` · Reviewed ${new Date(request.reviewedAt).toLocaleString()}`}
                </div>

                <details className='mt-3 text-sm text-gray-600'>
                  <summary className='cursor-pointer text-indigo-600 hover:text-indigo-500'>
                    View requested changes
                  </summary>
                  <pre className='mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs text-gray-700'>
                    {JSON.stringify(
                      JSON.parse(request.changes || '{}'),
                      null,
                      2
                    )}
                  </pre>
                </details>

                {request.comment && (
                  <p className='mt-3 rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-700'>
                    Reviewer comment: {request.comment}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
