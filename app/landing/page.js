'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCube,
  FaGraduationCap,
  FaUsers,
  FaChartBar,
  FaShieldAlt,
  FaRocket,
  FaArrowRight,
} from 'react-icons/fa';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-black bg-opacity-20'></div>
        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-8'>
              <FaGraduationCap className='text-4xl text-white' />
            </div>

            <h1 className='text-5xl md:text-7xl font-bold text-white mb-6'>
              Advanced
              <span className='block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Exam Management
              </span>
              System
            </h1>

            <p className='text-xl text-white/80 mb-8 max-w-3xl mx-auto'>
              Experience the future of online examinations with our cutting-edge
              3D interface, real-time analytics, and intelligent student
              management.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link
                href='/login-3d'
                className='group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 flex items-center'
              >
                <FaCube className='mr-3 text-xl' />
                Experience 3D Login
                <FaArrowRight className='ml-3 group-hover:translate-x-1 transition-transform' />
              </Link>

              <Link
                href='/(auth)/login'
                className='px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300'
              >
                Standard Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-24 bg-white/5 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Revolutionary Features
            </h2>
            <p className='text-xl text-white/70'>
              Powered by advanced 3D technology and AI
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* 3D Interface */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6'>
                <FaCube className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                3D Interface
              </h3>
              <p className='text-white/70 mb-6'>
                Immersive 3D login experience with interactive elements and
                smooth animations.
              </p>
              <div className='flex items-center text-blue-400 font-semibold'>
                <span>Explore Now</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>

            {/* Student Management */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6'>
                <FaUsers className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                Student Groups
              </h3>
              <p className='text-white/70 mb-6'>
                Organize students into groups, assign exams, and send targeted
                notifications.
              </p>
              <div className='flex items-center text-green-400 font-semibold'>
                <span>Learn More</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>

            {/* Analytics */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6'>
                <FaChartBar className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                Real-time Analytics
              </h3>
              <p className='text-white/70 mb-6'>
                Comprehensive reports and insights with advanced filtering and
                export options.
              </p>
              <div className='flex items-center text-purple-400 font-semibold'>
                <span>View Reports</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>

            {/* Security */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6'>
                <FaShieldAlt className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                Enterprise Security
              </h3>
              <p className='text-white/70 mb-6'>
                Bank-level security with role-based access control and audit
                logging.
              </p>
              <div className='flex items-center text-red-400 font-semibold'>
                <span>Security Details</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>

            {/* Performance */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6'>
                <FaRocket className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                High Performance
              </h3>
              <p className='text-white/70 mb-6'>
                Optimized for speed with advanced caching and real-time
                synchronization.
              </p>
              <div className='flex items-center text-yellow-400 font-semibold'>
                <span>Performance Stats</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>

            {/* Innovation */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6'>
                <FaGraduationCap className='text-2xl text-white' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-4'>
                Smart Learning
              </h3>
              <p className='text-white/70 mb-6'>
                AI-powered insights and adaptive learning paths for better
                outcomes.
              </p>
              <div className='flex items-center text-indigo-400 font-semibold'>
                <span>Discover AI</span>
                <FaArrowRight className='ml-2' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='py-16 bg-white/5 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='text-4xl font-bold text-white mb-2'>10K+</div>
              <div className='text-white/70'>Active Users</div>
            </div>
            <div>
              <div className='text-4xl font-bold text-white mb-2'>50K+</div>
              <div className='text-white/70'>Exams Created</div>
            </div>
            <div>
              <div className='text-4xl font-bold text-white mb-2'>98%</div>
              <div className='text-white/70'>Success Rate</div>
            </div>
            <div>
              <div className='text-4xl font-bold text-white mb-2'>24/7</div>
              <div className='text-white/70'>Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-24'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Transform Your Exam Experience?
          </h2>
          <p className='text-xl text-white/70 mb-8'>
            Join thousands of educators who are already using our advanced 3D
            exam management system.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/login-3d'
              className='px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 flex items-center justify-center'
            >
              <FaCube className='mr-3' />
              Start with 3D Login
            </Link>
            <Link
              href='/register'
              className='px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center'
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='py-8 border-t border-white/10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <p className='text-white/60'>
            © 2024 Advanced Exam Management System. Powered by 3D Technology.
          </p>
        </div>
      </div>
    </div>
  );
}
