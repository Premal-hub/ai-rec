'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
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
        const res = await api.get('/api/admin/me');
        if (!res.ok) {
          throw new Error(res.error || 'Unauthorized');
        }

        const role = res.admin?.role || res.user?.role || 'client';
        setUserRole(role);

        if (!['superadmin', 'admin', 'manager'].includes(role)) {
          router.push('/client');
          return;
        }

        fetchStats();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      if (res.ok) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const roleData = [
    { name: 'Clients', value: stats?.totalClients || 0 },
    { name: 'Admins', value: stats?.totalAdmins || 0 }
  ];

  const activityData = [
    { name: 'Sessions', value: stats?.totalSessions || 0 },
    { name: 'Feedback', value: stats?.totalFeedback || 0 },
    { name: 'Chats', value: stats?.totalChats || 0 }
  ];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
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

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics & Reports</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => exportData(stats?.userGrowth || [], 'user-growth.csv')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="ri-download-line mr-2"></i>
              Export Growth
            </button>
          </div>
        </div>

        {/* Key Metrics */}
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
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.newUsersThisWeek || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">New This Week</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <i className="ri-user-add-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalSessions || 0}</p>
                <p className="text-gray-600 dark:text-gray-300">Total Sessions</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-chat-1-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats?.totalFeedback && stats?.totalSessions ? Math.round((stats.totalFeedback / stats.totalSessions) * 100) : 0}%
                </p>
                <p className="text-gray-600 dark:text-gray-300">Feedback Rate</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
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
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${typeof percent === 'number' && !isNaN(percent) ? (percent * 100).toFixed(0) : '0'}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Overview */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activity Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Avg. Chats per Session</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {stats?.totalSessions && stats?.totalChats ? (stats.totalChats / stats.totalSessions).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Feedback Completion Rate</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {stats?.totalSessions && stats?.totalFeedback ? `${Math.round((stats.totalFeedback / stats.totalSessions) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">User Retention (Est.)</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {stats?.totalUsers ? `${Math.min(100, Math.round((stats.totalUsers - (stats.newUsersThisWeek || 0)) / stats.totalUsers * 100))}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Admin-to-User Ratio</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {stats?.totalUsers && stats?.totalAdmins ? `1:${Math.round(stats.totalUsers / stats.totalAdmins)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Export Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportData(stats?.userGrowth || [], 'user-growth-report.csv')}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-file-chart-line"></i>
              User Growth Report
            </button>
            <button
              onClick={() => exportData(activityData, 'activity-report.csv')}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-file-list-line"></i>
              Activity Report
            </button>
            <button
              onClick={() => exportData(roleData, 'role-distribution-report.csv')}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-file-user-line"></i>
              Role Distribution Report
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
