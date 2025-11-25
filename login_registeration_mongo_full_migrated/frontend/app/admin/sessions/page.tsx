'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

interface SessionData {
  _id: string;
  started_at: string;
  updated_at: string;
  completed: boolean;
  duration: number | null;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ChatData {
  _id: string;
  message: string;
  sender: string;
  timestamp: string;
}

export default function SessionsPage() {
  const { user, loading } = useRequireAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [sessionChats, setSessionChats] = useState<ChatData[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
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

        fetchSessions();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/admin/sessions');
      if (res.ok) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const fetchSessionChats = async (sessionId: string) => {
    try {
      const res = await api.get(`/api/admin/chats/${sessionId}`);
      if (res.ok) {
        setSessionChats(res.chats);
      }
    } catch (err) {
      console.error('Error fetching session chats:', err);
    }
  };

  const handleViewChats = async (session: SessionData) => {
    setSelectedSession(session);
    await fetchSessionChats(session._id);
    setShowChatModal(true);
  };

  const filteredSessions = sessions.filter(session => {
    const userName = session.userId?.name || 'Anonymous';
    const userEmail = session.userId?.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus ||
                         (selectedStatus === 'completed' && session.completed) ||
                         (selectedStatus === 'active' && !session.completed);
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading sessions...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sessions & Chats</h1>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <i className="ri-refresh-line mr-2"></i>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">All Sessions</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Started</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-800 dark:text-white font-medium">{session.userId?.name || 'Anonymous'}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{session.userId?.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {new Date(session.started_at).toLocaleDateString()} <br />
                        <span className="text-sm">{new Date(session.started_at).toLocaleTimeString()}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.completed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {session.completed ? 'Completed' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewChats(session)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          View Chats
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSessions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        {showChatModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Chat Session - {selectedSession.userId?.name || 'Anonymous'}
                  </h3>
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Started: {new Date(selectedSession.started_at).toLocaleString()}
                </p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {sessionChats.length > 0 ? (
                  <div className="space-y-4">
                    {sessionChats.map((chat) => (
                      <div
                        key={chat._id}
                        className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            chat.sender === 'user'
                              ? 'bg-red-500 text-white'
                              : chat.sender === 'bot'
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{chat.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(chat.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No chat messages found for this session</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Session Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{sessions.length}</p>
              <p className="text-gray-600 dark:text-gray-300">Total Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {sessions.filter(s => s.completed).length}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {sessions.filter(s => !s.completed).length}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {sessions.length > 0 ? Math.round(sessions.filter(s => s.completed).length / sessions.length * 100) : 0}%
              </p>
              <p className="text-gray-600 dark:text-gray-300">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
