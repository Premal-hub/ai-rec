'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface User {
  _id: string;
  email: string;
  role: string;
  displayName?: string;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  newUsersThisWeek: number;
  totalSessions: number;
  totalFeedback: number;
  totalChats: number;
  userGrowth: { _id: string; count: number }[];
}

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoadingData(false);
        return;
      }

      try {
        const res = await api.getAdminProfile();
        if (!res.ok) {
          throw new Error(res.error || 'Unauthorized');
        }

        const role = res.admin?.role || res.user?.role || 'client';
        setUserRole(role);

        if (!['superadmin', 'admin', 'manager'].includes(role)) {
          router.push('/client');
          return;
        }

        // Fetch stats
        const statsRes = await api.get('/api/admin/stats');
        if (statsRes.ok) {
          setStats(statsRes.stats);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        const error = err as { status?: number; message?: string };
        if (error.status === 401) {
          // Token invalid or expired, redirect to login
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setUserRole('admin'); // fallback for other errors
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole || !['superadmin', 'admin', 'manager'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {userName}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalUsers || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">Total Users</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalAdmins || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">Admins</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <i className="ri-admin-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalSessions || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">Sessions</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <i className="ri-chat-1-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalFeedback || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">Feedback</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-feedback-line text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">User Growth (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Clients', value: stats?.totalClients || 0 },
                { name: 'Admins', value: stats?.totalAdmins || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats?.newUsersThisWeek || 0}</p>
              <p className="text-gray-600 dark:text-gray-300">New Users This Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats?.totalChats || 0}</p>
              <p className="text-gray-600 dark:text-gray-300">Total Chats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {stats?.totalFeedback && stats?.totalSessions ? Math.round((stats.totalFeedback / stats.totalSessions) * 100) : 0}%
              </p>
              <p className="text-gray-600 dark:text-gray-300">Feedback Rate</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
