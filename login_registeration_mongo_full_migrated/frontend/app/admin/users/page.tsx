'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const { user, loading } = useRequireAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

        fetchUsers();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      if (res.ok) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleEditUser = async (userData: UserData) => {
    try {
      const res = await api.put(`/api/admin/users/${userData._id}`, {
        role: userData.role
      });

      if (res.ok) {
        setUsers(users.map(u => u._id === userData._id ? res.user : u));
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        alert('Failed to update user: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + (err.message || 'Network error'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || userData.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading user management...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
          <button
            onClick={fetchUsers}
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                {userRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userData) => (
                    <tr key={userData._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-gray-800 dark:text-white">{userData.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{userData.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userData.role === 'superadmin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : userData.role === 'admin'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : userData.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {userData.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(userData);
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          {userData.role !== 'superadmin' && (
                            <button
                              onClick={() => handleDeleteUser(userData._id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Edit User</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditUser(editingUser);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="client">Client</option>
                      <option value="manager">Manager</option>
                      {userRole === 'superadmin' && (
                        <>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </>
                      )}
                      {userRole === 'admin' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
