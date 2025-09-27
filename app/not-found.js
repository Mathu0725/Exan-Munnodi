import Link from 'next/link';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8">
          <FaExclamationTriangle className="text-4xl text-white" />
        </div>
        
        {/* 404 Text */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 flex items-center"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
        
        {/* Additional Links */}
        <div className="mt-12 text-center">
          <p className="text-white/60 mb-4">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/login-3d" className="text-white/80 hover:text-white transition-colors">
              3D Login
            </Link>
            <Link href="/(auth)/login" className="text-white/80 hover:text-white transition-colors">
              Standard Login
            </Link>
            <Link href="/landing" className="text-white/80 hover:text-white transition-colors">
              Landing Page
            </Link>
            <Link href="/register" className="text-white/80 hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
