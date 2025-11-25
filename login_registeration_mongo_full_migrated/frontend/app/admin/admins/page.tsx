'use client';

import { useRequireAuth } from '../../../hooks/useAuthRedirect';
import { useEffect, useState } from 'react';
import { api } from '@/utils/apiClient';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminManagementPage() {
  const { user, loading } = useRequireAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ email: '', role: 'manager' });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);
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

        if (role !== 'superadmin') {
          router.push('/admin/dashboard');
          return;
        }

        fetchAdmins();
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserRole('admin');
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) checkUserRole();
  }, [user, loading, router]);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/api/admin/admins');
      if (res.ok) {
        setAdmins(res.admins);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.role) {
      alert('Please fill in all fields');
      return;
    }

    setAddingAdmin(true);
    try {
      const res = await api.post('/api/admin/admins', newAdmin);
      if (res.ok) {
        setAdmins([...admins, res.admin]);
        setShowAddModal(false);
        setNewAdmin({ email: '', role: 'manager' });
        alert('Admin added successfully! They will receive an email with setup instructions.');
      }
    } catch (err: any) {
      console.error('Error adding admin:', err);
      if (err.status === 409 && err.data?.existingUser) {
        // Show error message in UI
        setEmailExistsError(true);
        setExistingUser(err.data.existingUser);
        setShowUpgradeModal(true);
        setShowAddModal(false);
      } else {
        alert(err.message || 'Failed to add admin');
      }
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleUpgradeRole = async () => {
    if (!existingUser) return;

    setAddingAdmin(true);
    try {
      const res = await api.post('/api/admin/admins', {
        email: existingUser.email,
        role: newAdmin.role,
        upgrade: true
      });
      if (res.ok) {
        // Update the admin in the list
        setAdmins(admins.map(admin =>
          admin._id === existingUser._id
            ? { ...admin, role: newAdmin.role }
            : admin
        ));
        setShowUpgradeModal(false);
        setExistingUser(null);
        setEmailExistsError(false);
        setNewAdmin({ email: '', role: 'manager' });
        alert('User role upgraded successfully! They will receive an email with setup instructions.');
      }
    } catch (err: any) {
      console.error('Error upgrading role:', err);
      alert(err.response?.data?.error || 'Failed to upgrade role');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

    try {
      const res = await api.delete(`/api/admin/users/${adminId}`);
      if (res.ok) {
        setAdmins(admins.filter(a => a._id !== adminId));
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('Failed to delete admin');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin management...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">Only superadmins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Management</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchAdmins}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <i className="ri-add-line mr-2"></i>
              Add Admin
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-500">{admins.filter(a => a.role === 'superadmin').length}</p>
                <p className="text-gray-600 dark:text-gray-300">Superadmins</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-vip-crown-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-500">{admins.filter(a => a.role === 'admin').length}</p>
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
                <p className="text-2xl font-bold text-blue-500">{admins.filter(a => a.role === 'manager').length}</p>
                <p className="text-gray-600 dark:text-gray-300">Managers</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="ri-user-settings-line text-white text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-500">{admins.length}</p>
                <p className="text-gray-600 dark:text-gray-300">Total Admins</p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <i className="ri-group-line text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
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
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-gray-800 dark:text-white">{admin.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{admin.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            admin.role === 'superadmin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : admin.role === 'admin'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {admin.role === 'superadmin' && <i className="ri-vip-crown-line text-yellow-500"></i>}
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {admin.role !== 'superadmin' && (
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {admins.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No admins found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Admin</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddAdmin();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {addingAdmin ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line"></i>
                        Add Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upgrade Role Modal */}
        {showUpgradeModal && existingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upgrade User Role</h3>
              <div className="space-y-4">
                {emailExistsError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      email already exist
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Old role: <strong>{existingUser.role}</strong>. Want to upgrade to <strong>{newAdmin.role}</strong>?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setExistingUser(null);
                      setShowAddModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgradeRole}
                    disabled={addingAdmin}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {addingAdmin ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Upgrading...
                      </>
                    ) : (
                      <>
                        <i className="ri-arrow-up-line"></i>
                        Upgrade Role
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
