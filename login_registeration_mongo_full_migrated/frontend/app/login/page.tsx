// frontend/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedPage from '../../components/AnimatedPage';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthRedirect } from '@/hooks/useAuthRedirect'; // ✅ Auth redirect hook

// Eye icons
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

// ------------------ Zod Validation Schema ------------------
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

// ------------------ Main Component ------------------
export default function LoginPage() {
  // ✅ Redirect logged-in users away from login page
  useAuthRedirect({ redirectIfAuthenticated: true });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // ------------------ Form Submission ------------------
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await api.login({
        email: data.email,
        password: data.password,
      });

      if (!result.ok) throw new Error(result.error || 'Login failed');

      // Save JWT token
      if (result.token) localStorage.setItem('token', result.token);

      // Check user role and redirect accordingly
      if (['superadmin', 'admin', 'manager'].includes(result.role)) {
        router.push('/admin'); // Redirect admin roles to admin page
      } else {
        router.push('/client'); // Redirect client to client page
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ JSX ------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Animated Page Wrapper */}
      <AnimatedPage className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-['Pacifico'] text-3xl text-gray-800 dark:text-white mb-2">
                Ai counselling
              </h1>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium whitespace-nowrap cursor-pointer"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Forgot your password?
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
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
