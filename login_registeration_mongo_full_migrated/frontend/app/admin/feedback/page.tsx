'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

interface FeedbackData {
  _id: string;
  comments: string;
  rating: number;
  submitted_at: string;
  userId: {
    name: string;
    email: string;
  };
  sessionId?: {
    started_at: string;
    completed: boolean;
  } | null;
}

export default function FeedbackPage() {
  const { user, loading } = useRequireAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
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

        fetchFeedback();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/api/admin/feedback');
      if (res.ok) {
        setFeedback(res.feedback);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const userName = item.userId?.name || 'Anonymous';
    const userEmail = item.userId?.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.comments.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !selectedRating || item.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ri-star-${i < rating ? 'fill' : 'line'} text-yellow-400`}
      ></i>
    ));
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading feedback...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Feedback Management</h1>
          <button
            onClick={fetchFeedback}
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
                placeholder="Search by user name, email, or comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div key={item._id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.userId?.name || 'Anonymous'}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.userId?.email || 'No email'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">({item.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.submitted_at).toLocaleDateString()} at {new Date(item.submitted_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {item.comments && (
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{item.comments}"</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Session: {item.sessionId ? new Date(item.sessionId.started_at).toLocaleDateString() : 'N/A'}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.sessionId?.completed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {item.sessionId?.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          ))}

          {filteredFeedback.length === 0 && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
              <i className="ri-feedback-line text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No feedback found</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Feedback Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{feedback.length}</p>
              <p className="text-gray-600 dark:text-gray-300">Total Feedback</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {feedback.length > 0 ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) : 0}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {feedback.filter(item => item.rating >= 4).length}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Positive (4-5★)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {feedback.filter(item => item.rating <= 2).length}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Needs Improvement (1-2★)</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
