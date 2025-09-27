'use client';

import { useEffect } from 'react';
import { FaExclamationTriangle, FaRefresh, FaHome } from 'react-icons/fa';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8">
          <FaExclamationTriangle className="text-4xl text-white" />
        </div>
        
        {/* Error Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Oops!</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Something went wrong</h2>
        <p className="text-lg text-white/70 mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="group px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transform transition-all duration-300 hover:scale-105 flex items-center"
          >
            <FaRefresh className="mr-2" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
        </div>
        
        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-white/60 cursor-pointer hover:text-white transition-colors">
              Error Details (Development Only)
            </summary>
            <pre className="mt-4 p-4 bg-black/20 rounded-lg text-white/80 text-xs overflow-auto">
              {error?.message || 'No error message available'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
