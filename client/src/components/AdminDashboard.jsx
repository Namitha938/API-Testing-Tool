import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  FolderOpen,
  Zap,
  Clock,
  CheckCircle,
  X,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const { token, user: currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAdminData();
  }, [isOpen, token]);

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their collections?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase font-mono">
            403 UNAUTHORIZED
          </div>
          <h3 className="text-xl font-bold text-white">Access Denied</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Signed in as <strong className="text-white font-mono">{currentUser?.email || 'User'}</strong> (Role: <span className="text-amber-400 uppercase font-mono">{currentUser?.role || 'user'}</span>).
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-left">
            Administrator privileges are restricted to whitelisted accounts (<code className="text-purple-300 font-mono">singunamitha@gmail.com</code> and <code className="text-purple-300 font-mono">s.v.padmavathi2005@gmail.com</code>).
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Administrator Console</h2>
              <p className="text-xs text-slate-400">System analytics, database stats & user access management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                  <span>Registered Users</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{stats.totalUsers}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-medium">{stats.activeUsers} active accounts</div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                  <span>API Collections</span>
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{stats.totalCollections}</div>
                <div className="text-[11px] text-slate-500 mt-1">{stats.totalSavedRequests} saved requests</div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                  <span>Total Executions</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100">{stats.totalExecutions}</div>
                <div className="text-[11px] text-slate-500 mt-1">Logged requests</div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                  <span>Test Pass Rate</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{stats.testPassRate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Avg latency: {stats.avgResponseTime}ms</div>
              </div>
            </div>
          )}

          {/* User Management Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-200">Registered Users Management</h3>
              <span className="text-xs text-slate-400">{users.length} Total Users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/40 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Collections</th>
                    <th className="p-3">Executions</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-slate-200">
                        {u.name}
                        {currentUser?._id === u._id && (
                          <span className="ml-1.5 text-[10px] text-sky-400 font-normal">(You)</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{u.collectionsCount || 0}</td>
                      <td className="p-3 text-slate-400">{u.executionsCount || 0}</td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Admin */}
                          <button
                            onClick={() => toggleUserRole(u._id, u.role)}
                            disabled={currentUser?._id === u._id}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[11px] transition"
                            title="Toggle User/Admin Role"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => toggleUserStatus(u._id, u.status)}
                            disabled={currentUser?._id === u._id}
                            className={`p-1.5 rounded transition ${
                              u.status === 'active'
                                ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400'
                            }`}
                            title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteUser(u._id)}
                            disabled={currentUser?._id === u._id}
                            className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition disabled:opacity-30"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

