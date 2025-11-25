// frontend/app/client/history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import AnimatedPage from '../../../components/AnimatedPage';
import ThemeToggle from '../../../components/ThemeToggle';
import LogoutButton from '../../../components/LogoutButton';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Chat {
  _id: string;
  message: string;
  sender: 'user' | 'bot' | 'admin';
  sessionId: { title: string } | null;
  timestamp: string;
}

interface UserData {
  name: string;
  email: string;
  role?: string;
}

export default function HistoryPage() {
  // Redirect unauthenticated users to login
  useAuthRedirect({ redirectIfNotAuthenticated: true });

  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and chat history
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

        const chatsRes = await api.getUserChats(result.payload.sub);
        if (!chatsRes.ok) throw new Error(chatsRes.error || 'Failed to fetch chats');

        setChats(chatsRes.chats);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your chat history...</p>
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
              <h1 className="font-['Pacifico'] text-2xl text-gray-800 dark:text-white">Chat History</h1>
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
              Your Chat History
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Review your past conversations with our AI.
            </p>
          </motion.div>

          {/* Chat History */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Conversations</h2>
            {chats.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No chat history available.</p>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`p-4 rounded-lg ${
                      chat.sender === 'user'
                        ? 'bg-blue-100 dark:bg-blue-900/30 ml-12'
                        : 'bg-gray-100 dark:bg-gray-700/60 mr-12'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-semibold ${
                        chat.sender === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {chat.sender === 'user' ? 'You' : chat.sender === 'bot' ? 'AI' : 'Admin'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(chat.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white">{chat.message}</p>
                    {chat.sessionId && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Session: {chat.sessionId.title}
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
