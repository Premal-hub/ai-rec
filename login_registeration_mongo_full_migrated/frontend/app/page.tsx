
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../hooks/useAuthRedirect';
import Link from 'next/link';
import AnimatedPage from '../components/AnimatedPage';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect based on their role
    // This is handled in useAuthRedirect hook
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-blue-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <AnimatedPage className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="font-['Pacifico'] text-6xl text-gray-800 dark:text-white mb-4">Ai Counselling</h1>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome to Ai Counselling
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            A complete authentication system with role-based access, beautiful UI, and responsive design. 
            Get started by signing in or creating a new account.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg whitespace-nowrap cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-lg whitespace-nowrap cursor-pointer"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Secure Auth</h3>
              <p className="text-gray-600 dark:text-gray-300">
                MongoDB authentication with role-based access control and email verification
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-palette-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Beautiful UI</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Modern design with advanced theme switcher and smooth animations
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-settings-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Role-Based Access</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Different dashboards for admin and client users with personalized features
              </p>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </div>
  );
}
