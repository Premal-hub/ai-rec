// frontend/hooks/useAuthRedirect.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthRedirect = ({
  redirectIfAuthenticated = false,
  redirectIfNotAuthenticated = false,
} = {}) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (redirectIfAuthenticated && token) {
      // User is logged in, redirect away from login/register
      router.replace('/client');
    }

    if (redirectIfNotAuthenticated && !token) {
      // User is not logged in, redirect to login
      router.replace('/login');
    }
  }, [redirectIfAuthenticated, redirectIfNotAuthenticated, router]);
};

export const useRequireAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // Verify token with backend
    fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.payload);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return { user, loading };
};
