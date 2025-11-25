'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../hooks/useAuthRedirect';

export default function AdminPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return null;
}
