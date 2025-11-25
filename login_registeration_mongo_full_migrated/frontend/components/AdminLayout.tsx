'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAuth } from '../hooks/useAuthRedirect';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

const HEADER_HEIGHT = 64; // px (matches h-16)

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, userRole }) => {
  const { user } = useRequireAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile nice-to-have)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/users', label: 'User Management', icon: 'ri-user-settings-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/feedback', label: 'Feedback', icon: 'ri-feedback-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/analytics', label: 'Analytics', icon: 'ri-bar-chart-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/sessions', label: 'Sessions', icon: 'ri-chat-1-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/system', label: 'System', icon: 'ri-settings-line', roles: ['superadmin', 'admin', 'manager'] },
    { href: '/admin/admins', label: 'Admin Management', icon: 'ri-admin-line', roles: ['superadmin'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => userRole && item.roles.includes(userRole || ''));

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900">
      {/* Sidebar (fixed on left for lg and up, slide-in on mobile) */}
      <aside
        aria-hidden={!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h1 className="font-['Pacifico'] text-xl text-gray-800 dark:text-white">AI Counselling</h1>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-line text-white text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area: reserve header height and sidebar width on large screens */}
      <div
        className="min-h-screen transition-all duration-300 ease-in-out lg:ml-64"
        style={{ paddingTop: `${HEADER_HEIGHT}px` }} // reserve header space
      >
        {/* Top Bar (sticky so content below does not overlap) */}
        <header className="fixed top-0 left-0 right-0 z-40 lg:left-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                aria-label="Toggle sidebar"
              >
                <i className="ri-menu-line text-xl"></i>
              </button>
            </div>

            <div className="flex items-center gap-4">
            </div>
          </div>
        </header>

        {/* Page Content container: uses padding so it starts below header and not under it */}
        <main className="py-6 px-4 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
