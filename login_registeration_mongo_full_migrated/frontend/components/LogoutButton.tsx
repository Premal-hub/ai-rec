'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem('token'); // Remove token from localStorage
      router.push('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-md"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center"></i>
      )}
      {isLoading ? 'Signing out...' : 'Logout'}
    </button>
  );
}
