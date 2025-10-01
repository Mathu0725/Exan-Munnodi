'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestLoginPage() {
  const { login, user, loading, authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'geminipro09999@gmail.com',
    password: 'Mathusan1999',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await login(formData);
      setResult('Login successful: ' + JSON.stringify(response, null, 2));
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold mb-6'>Login Test</h1>

        <div className='mb-4'>
          <p>
            <strong>Current User:</strong> {user ? user.email : 'Not logged in'}
          </p>
          <p>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email
            </label>
            <input
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password
            </label>
            <input
              type='password'
              value={formData.password}
              onChange={e =>
                setFormData(prev => ({ ...prev, password: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <button
            type='submit'
            disabled={authLoading}
            className='w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50'
          >
            {authLoading ? 'Logging in...' : 'Test Login'}
          </button>
        </form>

        {error && (
          <div className='mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className='mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
            <strong>Success:</strong>
            <pre className='mt-2 text-xs overflow-auto'>{result}</pre>
          </div>
        )}

        <div className='mt-6'>
          <a href='/login-3d' className='text-indigo-600 hover:text-indigo-800'>
            ← Back to 3D Login
          </a>
        </div>
      </div>
    </div>
  );
}
