'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import AdminLayout from '../../../components/AdminLayout';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';

export default function SystemPage() {
  const { user, loading } = useRequireAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
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

        // Generate mock system logs for demo
        generateMockLogs();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
        generateMockLogs();
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const generateMockLogs = () => {
    const logs = [
      `[${new Date().toISOString()}] Server started successfully on port 5000`,
      `[${new Date(Date.now() - 1000 * 60 * 5).toISOString()}] User authentication successful`,
      `[${new Date(Date.now() - 1000 * 60 * 10).toISOString()}] Database connection established`,
      `[${new Date(Date.now() - 1000 * 60 * 15).toISOString()}] Feedback submitted by user`,
      `[${new Date(Date.now() - 1000 * 60 * 20).toISOString()}] New user registered`,
      `[${new Date(Date.now() - 1000 * 60 * 25).toISOString()}] Session completed`,
      `[${new Date(Date.now() - 1000 * 60 * 30).toISOString()}] Admin login detected`,
      `[${new Date(Date.now() - 1000 * 60 * 35).toISOString()}] Password reset email sent`,
      `[${new Date(Date.now() - 1000 * 60 * 40).toISOString()}] Career test completed`,
      `[${new Date(Date.now() - 1000 * 60 * 45).toISOString()}] Recommendation generated`,
    ];
    setSystemLogs(logs);
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert('Please enter a notification message');
      return;
    }

    setSendingNotification(true);
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Notification sent successfully!');
      setNotificationMessage('');
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (!userRole || !['superadmin', 'admin', 'manager'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-white text-2xl"></i>
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Administration</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Monitor system activity and manage notifications</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <i className="ri-check-circle-line text-green-500 text-xl"></i>
                  <p className="text-2xl font-bold text-green-500">Online</p>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Server Status</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <i className="ri-server-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-500">Connected</p>
                <p className="text-gray-600 dark:text-gray-300">Database</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-database-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-500">Active</p>
                <p className="text-gray-600 dark:text-gray-300">Email Service</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-mail-line text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Send Notification */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Send System Notification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Message
              </label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message to send to all users..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
              />
            </div>
            <button
              onClick={handleSendNotification}
              disabled={sendingNotification || !notificationMessage.trim()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sendingNotification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line"></i>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">System Logs</h3>
              <button
                onClick={generateMockLogs}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                Refresh Logs
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {systemLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Environment</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>Node Version: v18.17.0</p>
                <p>Platform: {typeof window !== 'undefined' ? navigator.platform : 'Server'}</p>
                <p>Environment: Production</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Database</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>MongoDB Atlas: Connected</p>
                <p>Connection Pool: 10</p>
                <p>Last Backup: 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Theme Settings</h3>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <i className="ri-palette-line text-white text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Appearance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Customize your visual experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      resolvedTheme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mb-1">
                      <i className="ri-sun-line text-white text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      resolvedTheme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mb-1">
                      <i className="ri-moon-line text-white text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-gray-800 rounded-full flex items-center justify-center mb-1">
                      <i className="ri-computer-line text-white text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Logout</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sign out of your account</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
