// frontend/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/utils/apiClient';
import Link from 'next/link';
import AnimatedPage from '../../components/AnimatedPage';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthRedirect } from '@/hooks/useAuthRedirect'; // ✅ Auth redirect hook

// ------------------ Zod Validation Schema ------------------
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

// ------------------ Main Component ------------------
export default function ForgotPasswordPage() {
  // Redirect logged-in users away from forgot-password page
  useAuthRedirect({ redirectIfAuthenticated: true });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.forgotPassword({ email: data.email });
      if (!result.ok) throw new Error(result.error || 'Failed to send reset email');

      setSuccess('Password reset email sent! Please check your inbox and follow the instructions.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ JSX ------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-green-900">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <AnimatedPage className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-['Pacifico'] text-3xl text-gray-800 dark:text-white mb-2">Ai counselling</h1>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-300">We'll send you a link to reset your password</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Error / Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium whitespace-nowrap cursor-pointer"
              >
                {isLoading ? 'Sending email...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <Link
                href="/login"
                className="text-green-600 dark:text-green-400 hover:underline text-sm cursor-pointer"
              >
                Back to Sign In
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-green-600 dark:text-green-400 hover:underline cursor-pointer">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </div>
  );
}
