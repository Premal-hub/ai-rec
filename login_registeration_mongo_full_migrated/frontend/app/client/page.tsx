// frontend/app/client/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import AnimatedPage from '../../components/AnimatedPage';
import ThemeToggle from '../../components/ThemeToggle';
import LogoutButton from '../../components/LogoutButton';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export default function ClientPage() {
  // Redirect unauthenticated users to login
  useAuthRedirect({ redirectIfNotAuthenticated: true });

  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const result = await api.verifyToken(token); // Calls /verify-token
        if (!result.ok) throw new Error(result.error || 'Unauthorized');

        // Fetch full user data from backend
        const res = await api.getUser(result.payload.sub);
        if (!res.ok) throw new Error(res.error || 'Failed to fetch user');

        setUser(res.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract user details
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();
  const userRole = user?.role || 'Client';

  // Handle card clicks (no <Link>)
  const handleCardClick = (title: string) => {
    switch (title) {
      case 'Career Guidance':
        router.push('/career'); // redirects to frontend/app/career/page.tsx
        break;
      // case 'Education Support':
      //   router.push('/education-support');
      //   break;
      // case 'Behavioural (Habit Change)':
      //   alert('Behavioural feature coming soon!');
      //   break;
      // case 'Emotional Insight':
      //   alert('Emotional insight feature coming soon!');
      //   break;
      // case 'Mental health':
      //   router.push('/mental-health');
      //   break;
      case 'History':
        router.push('/client/history');
        break;
      case 'Feedback':
        router.push('/client/feedback');
        break;
      default:
        alert('Feature not implemented yet.');
    }
  };

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
              <h1 className="font-['Pacifico'] text-2xl text-gray-800 dark:text-white">Smart AI Counselling</h1>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                Client
              </span>
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
              Welcome, {userName}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore AI-powered career guidance and mental wellness tools.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: 'ri-brain-line', title: 'Career Guidance', desc: 'Answer questions and get personalized career suggestions.', color: 'bg-blue-500' },
              // { icon: 'ri-chat-3-line', title: 'Education Support', desc: 'Chat anonymously with our AI for personal guidance.', color: 'bg-green-500' },
              // { icon: 'ri-booklet-line', title: 'Behavioural (Habit Change)', desc: 'We recommend courses based on your goals.', color: 'bg-purple-500' },
              // { icon: 'ri-heart-pulse-line', title: 'Emotional Insight', desc: 'We detect your emotional tone for better help.', color: 'bg-pink-500' },
              // { icon: 'ri-history-line', title: 'Mental health', desc: 'See your quiz results, chats, and suggestions.', color: 'bg-yellow-500' },
              { icon: 'ri-history-line', title: 'History', desc: 'View your chat history.', color: 'bg-orange-500' },
              { icon: 'ri-feedback-line', title: 'Feedback', desc: 'Provide feedback and view past submissions.', color: 'bg-teal-500' },
            ].map(({ icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                onClick={() => handleCardClick(title)}
                className="cursor-pointer bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition duration-300 border border-white/20"
              >
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
                  <i className={`${icon} text-white text-xl`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Account Info Section */}
          <div className="mt-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                <p className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60 rounded-lg px-4 py-3">{userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <p className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60 rounded-lg px-4 py-3">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
                <p className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60 rounded-lg px-4 py-3">{memberSince}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <p className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60 rounded-lg px-4 py-3">{userRole}</p>
              </div>
            </div>
          </div>
        </main>
      </AnimatedPage>
    </div>
  );
}
