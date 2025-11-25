// frontend/app/client/feedback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import AnimatedPage from '../../../components/AnimatedPage';
import ThemeToggle from '../../../components/ThemeToggle';
import LogoutButton from '../../../components/LogoutButton';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Feedback {
  _id: string;
  comments: string;
  rating: number;
  sessionId: { title: string } | null;
  submitted_at: string;
}

interface UserData {
  name: string;
  email: string;
  role?: string;
}

export default function FeedbackPage() {
  // Redirect unauthenticated users to login
  useAuthRedirect({ redirectIfNotAuthenticated: true });

  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ comments: '', rating: 5 });

  // Fetch user data and feedback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const result = await api.verifyToken(token);
        if (!result.ok) throw new Error(result.error || 'Unauthorized');

        const userRes = await api.getUser(result.payload.sub);
        if (!userRes.ok) throw new Error(userRes.error || 'Failed to fetch user');

        setUser(userRes.user);

        const feedbackRes = await api.getUserFeedback(result.payload.sub);
        if (!feedbackRes.ok) throw new Error(feedbackRes.error || 'Failed to fetch feedback');

        setFeedback(feedbackRes.feedback);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const result = await api.verifyToken(token);
      if (!result.ok) throw new Error(result.error || 'Unauthorized');

      const submitRes = await api.submitFeedback(result.payload.sub, formData);
      if (!submitRes.ok) throw new Error(submitRes.error || 'Failed to submit feedback');

      // Refresh feedback list
      const feedbackRes = await api.getUserFeedback(result.payload.sub);
      if (feedbackRes.ok) setFeedback(feedbackRes.feedback);

      setFormData({ comments: '', rating: 5 });
      alert('Feedback submitted successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit feedback: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  // Handle error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/client')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 overflow-hidden">
      {/* Floating Blobs */}
      <div className="absolute -top-40 -left-32 w-[300px] h-[300px] bg-green-300/40 dark:bg-green-800/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-purple-300/40 dark:bg-purple-800/40 rounded-full blur-2xl animate-pulse" />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/client')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="font-['Pacifico'] text-2xl text-gray-800 dark:text-white">Feedback</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <AnimatedPage>
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
              Your Feedback
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Share your thoughts and view past feedback.
            </p>
          </motion.div>

          {/* Submit Feedback Form */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Submit New Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating (1-5)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your feedback..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* Past Feedback */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Past Feedback</h2>
            {feedback.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div key={fb._id} className="p-4 bg-gray-100 dark:bg-gray-700/60 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        Rating: {fb.rating} Star{fb.rating > 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(fb.submitted_at).toLocaleString()}
                      </span>
                    </div>
                    {fb.comments && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{fb.comments}</p>
                    )}
                    {fb.sessionId && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Session: {fb.sessionId.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </AnimatedPage>
    </div>
  );
}
