import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  FolderOpen,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Search,
  UserPlus,
  Server,
  Database,
  Activity,
  Home,
  Sun,
  Moon,
  ArrowRight,
  ShieldAlert,
  LogIn,
  Key,
  Layers,
  ChevronRight,
  Check,
  X,
  Plus,
  BarChart3,
  TrendingUp,
  HardDrive,
  LogOut,
  Camera,
  User
} from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';
import { ProfileModal } from '../components/ProfileModal';

export default function AdminPage() {
  const { user, token, login, logout, loginWithGoogle, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  // Admin Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('performance'); // 'performance', 'users', 'logs', 'system'
  const [selectedLog, setSelectedLog] = useState(null);
  const [perfFilter, setPerfFilter] = useState('all'); // 'all', 'success', 'errors', 'slow'

  // New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [addUserError, setAddUserError] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Quick Admin Login State for unauthenticated users
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [quickLoginError, setQuickLoginError] = useState('');

  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/history', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchAdminData();
    }
  }, [isAdmin, token]);


  const handleGoogleAdminLogin = async () => {
    setQuickLoginLoading(true);
    setQuickLoginError('');
    try {
      await loginWithGoogle(true);
    } catch (err) {
      setQuickLoginError(err.message || 'Google admin login failed');
    } finally {
      setQuickLoginLoading(false);
    }
  };

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
    if (!confirm('Are you sure you want to permanently delete this user and all their saved collections?')) return;
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');

      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      fetchAdminData();
    } catch (err) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all system request history? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/history/clear', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navigation */}
      <header
        className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group" title="Return to Landing Page">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              Admin Console <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">SYS</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* White Home Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition shadow-xs"
            title="Return to Home"
          >
            <Home className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Launch Studio Link */}
          <Link
            to="/app"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Studio</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-100 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setProfileModalOpen(true)}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition cursor-pointer hover:scale-[1.02] ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Edit Profile and Avatar"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-purple-400/40 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`text-xs hidden md:inline ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Signed in as <strong className="text-purple-400 font-semibold">{user?.name}</strong>{' '}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                    ADMIN
                  </span>
                </span>
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setProfileModalOpen(true)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition cursor-pointer hover:scale-[1.02] ${
                  isDark
                    ? 'border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 text-slate-200'
                    : 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-slate-800'
                }`}
                title="Edit Profile and Upload Picture"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-rose-400/40 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`text-xs hidden md:inline ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Signed in as <strong className="text-rose-400 font-semibold">{user?.name}</strong>{' '}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-semibold">
                    UNAUTHORIZED
                  </span>
                </span>
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* UNAUTHENTICATED / NOT ADMIN GATEWAY */}
        {!isAdmin ? (
          user ? (
            /* 403 Forbidden: Signed in with unauthorized account */
            <div className="max-w-xl mx-auto my-8 p-8 rounded-2xl border text-center shadow-2xl transition-colors duration-200 bg-slate-900/95 border-rose-500/40">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold shadow">
                  403
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Access Denied • Unauthorized Account</span>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white">403 — Unauthorized Account</h2>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
                You are currently signed in, but your account is <strong>not authorized</strong> to access the Administrator Dashboard.
              </p>

              {/* Account Diagnostics Card */}
              <div className="text-left p-4 rounded-xl border border-slate-800 bg-slate-950/80 mb-6 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Signed-in User:</span>
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-slate-200 font-mono text-[11px]">{user.email}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Account Role:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] uppercase font-bold">
                    {user.role || 'user'} (Standard User)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Access Status:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono text-[10px] uppercase font-bold">
                    DENIED • UNAUTHORIZED
                  </span>
                </div>
              </div>

              {/* Whitelist Info Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 mb-6 text-left space-y-1">
                <div className="font-semibold text-slate-300">Authorized Administrator Whitelist:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Only designated administrator accounts (<code className="text-purple-300 font-mono">singunamitha@gmail.com</code> and <code className="text-purple-300 font-mono">s.v.padmavathi2005@gmail.com</code>) have access to system administration and latency telemetry.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Profile Picture & Edit Profile</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-rose-500/30 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out / Switch to Authorized Account</span>
                </button>

                <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <Link to="/app" className="text-sky-400 hover:underline flex items-center gap-1">
                    <span>Go to API Studio Workbench &rarr;</span>
                  </Link>
                  <Link to="/" className="text-slate-400 hover:text-white hover:underline">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Unauthenticated Gateway */
            <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border text-center shadow-xl transition-colors duration-200 bg-slate-900/90 border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2">Administrator Access Required</h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                This console provides high-privilege operations including user role elevation, access control, and telemetry. Sign in with an administrator account to continue.
              </p>

              {quickLoginError && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {quickLoginError}
                </div>
              )}

              <button
                onClick={handleGoogleAdminLogin}
                disabled={quickLoginLoading}
                className={`w-full py-2.5 px-4 rounded-xl border font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 mb-2.5 cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-100'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{quickLoginLoading ? 'Connecting...' : 'Continue with Google (Admin Access)'}</span>
              </button>

              <div className="mb-3 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-400 text-center font-medium">
                Authorized Admin Accounts: <span className="font-mono text-white">singunamitha@gmail.com</span>, <span className="font-mono text-white">s.v.padmavathi2005@gmail.com</span>
              </div>

              <div className="text-[11px] text-slate-500">
                Or sign in with custom credentials on the{' '}
                <Link to="/login" className="text-sky-400 hover:underline">
                  Login Page &rarr;
                </Link>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Top Stat Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Registered Users</span>
                    <Users className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-[11px] text-emerald-500 mt-1 font-medium">{stats.activeUsers} active accounts</div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Saved Collections</span>
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalCollections}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{stats.totalSavedRequests} total endpoints</div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Execution Audits</span>
                    <Zap className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalExecutions}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Logged requests</div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Test Suite Pass Rate</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">{stats.testPassRate}%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Avg latency: {stats.avgResponseTime}ms</div>
                </div>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'performance'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Performance & Latency</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'users'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User Management ({users.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'logs'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audit Logs ({auditLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('system')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'system'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>System Health</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdminData}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-xs flex items-center gap-1"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {activeTab === 'users' && (
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 0: PERFORMANCE MONITORING & LATENCY ANALYTICS */}
            {activeTab === 'performance' && (() => {
              const latencies = auditLogs.map((l) => l.responseTime || 0);
              const avgLatency = stats?.avgResponseTime || (latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0);
              const minLatency = latencies.length ? Math.min(...latencies) : 0;
              const maxLatency = latencies.length ? Math.max(...latencies) : 0;
              const sorted = [...latencies].sort((a, b) => a - b);
              const p50 = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 0;
              const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;

              // Chronological sequence for chart (oldest to newest, max 30 items)
              const chartData = [...auditLogs].reverse().slice(-30);
              const chartMax = Math.max(maxLatency * 1.25, 100);

              const chartW = 750;
              const chartH = 180;
              const padX = 40;
              const padY = 25;
              const plotW = chartW - padX * 2;
              const plotH = chartH - padY * 2;

              const points = chartData.map((d, i) => {
                const x = padX + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2);
                const y = padY + plotH - ((d.responseTime || 0) / chartMax) * plotH;
                return { x, y, data: d };
              });

              const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
              const areaPoints = points.length > 0
                ? `${points[0].x},${padY + plotH} ${polylinePoints} ${points[points.length - 1].x},${padY + plotH}`
                : '';

              const filteredLogs = auditLogs.filter((l) => {
                if (perfFilter === 'success') return l.status >= 200 && l.status < 300;
                if (perfFilter === 'errors') return l.status >= 400;
                if (perfFilter === 'slow') return (l.responseTime || 0) > 100;
                return true;
              });

              return (
                <div className="space-y-6">
                  {/* Performance Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Average Latency</span>
                      <div className="text-xl font-bold font-mono text-purple-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span>{avgLatency} ms</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Across {auditLogs.length} logged runs</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Fastest Request</span>
                      <div className="text-xl font-bold font-mono text-emerald-400">{minLatency} ms</div>
                      <span className="text-[10px] text-emerald-500/80 mt-1 block">Best execution latency</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Peak / Max Latency</span>
                      <div className="text-xl font-bold font-mono text-amber-400">{maxLatency} ms</div>
                      <span className="text-[10px] text-amber-500/80 mt-1 block">Worst execution round-trip</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">P50 (Median)</span>
                      <div className="text-xl font-bold font-mono text-sky-400">{p50} ms</div>
                      <span className="text-[10px] text-slate-500 mt-1 block">50th percentile response</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">P95 Latency</span>
                      <div className="text-xl font-bold font-mono text-rose-400">{p95} ms</div>
                      <span className="text-[10px] text-slate-500 mt-1 block">95th percentile SLA target</span>
                    </div>
                  </div>

                  {/* Interactive Response Time Chart Over Time */}
                  <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span>Per-Request Response Time Timeline (ms)</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Real-time chronological latency tracking across executions. Hover or click nodes to inspect.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> 2xx OK
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> 3xx Redir
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-400" /> 4xx/5xx Err
                        </span>
                      </div>
                    </div>

                    {chartData.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs">
                        <Clock className="w-8 h-8 mb-2 opacity-30" />
                        <p>No request latency data logged yet.</p>
                        <p className="text-[11px] text-slate-600 mt-1">Execute requests from the Studio to populate the latency timeline.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-48 select-none">
                          <defs>
                            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Reference grid lines */}
                          {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                            const y = padY + plotH - frac * plotH;
                            const labelVal = Math.round(frac * chartMax);
                            return (
                              <g key={idx}>
                                <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.4" />
                                <text x={padX - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="monospace">
                                  {labelVal}ms
                                </text>
                              </g>
                            );
                          })}

                          {/* Base Axis Line */}
                          <line x1={padX} y1={padY + plotH} x2={chartW - padX} y2={padY + plotH} stroke="#475569" strokeWidth="1" />

                          {/* Area Fill */}
                          {points.length > 1 && (
                            <polygon points={areaPoints} fill="url(#latencyGradient)" />
                          )}

                          {/* Line Stroke */}
                          {points.length > 1 && (
                            <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" points={polylinePoints} />
                          )}

                          {/* Interactive Circles */}
                          {points.map((p, idx) => {
                            const statusColor = p.data.status >= 200 && p.data.status < 300
                              ? '#10b981'
                              : p.data.status >= 300 && p.data.status < 400
                              ? '#f59e0b'
                              : '#f43f5e';
                            const isSelected = selectedLog?._id === p.data._id;

                            return (
                              <g key={idx} className="cursor-pointer" onClick={() => setSelectedLog(p.data)}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isSelected ? 6 : 4}
                                  fill={statusColor}
                                  stroke="#0f172a"
                                  strokeWidth={isSelected ? 2.5 : 1.5}
                                  className="transition-transform hover:scale-125"
                                />
                                <title>{`${p.data.method} ${p.data.url}: ${p.data.responseTime}ms (${p.data.status})`}</title>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {/* Inspected Request Inspector Banner */}
                    {selectedLog && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-purple-500/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded font-bold bg-sky-500/20 text-sky-300">{selectedLog.method}</span>
                          <span className="text-slate-200 truncate max-w-sm">{selectedLog.url}</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            selectedLog.status >= 200 && selectedLog.status < 300
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {selectedLog.status} {selectedLog.statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                          <span>Duration: <strong className="text-purple-400">{selectedLog.responseTime}ms</strong></span>
                          <span>TTFB: <strong className="text-amber-400">{selectedLog.timings?.ttfb || 0}ms</strong></span>
                          <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-slate-300 text-xs font-sans">
                            &times; Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Per-Request Latency Tracking Table */}
                  <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-slate-200">Per-Request Latency Telemetry</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                          {filteredLogs.length} Records
                        </span>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'success', label: '2xx Success' },
                          { id: 'errors', label: 'Errors' },
                          { id: 'slow', label: 'Slow (>100ms)' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setPerfFilter(btn.id)}
                            className={`px-2.5 py-1 rounded-md transition ${
                              perfFilter === btn.id
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className={`text-[10px] uppercase font-semibold border-b ${isDark ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          <tr>
                            <th className="p-3">Method</th>
                            <th className="p-3">Endpoint</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 w-48">Response Time (Latency)</th>
                            <th className="p-3">Timings Breakdown</th>
                            <th className="p-3">Initiator</th>
                            <th className="p-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y font-mono text-[11px] ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                                No requests match this filter. Send requests from the Studio to log response times.
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => {
                              const lat = log.responseTime || 0;
                              const pct = Math.min(100, Math.max(5, (lat / Math.max(maxLatency, 100)) * 100));
                              const meterColor = lat < 100 ? 'bg-emerald-500' : lat < 400 ? 'bg-amber-500' : 'bg-rose-500';

                              return (
                                <tr key={log._id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                  <td className="p-3 font-bold text-sky-400">{log.method}</td>
                                  <td className="p-3 text-slate-300 truncate max-w-xs">{log.url}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        log.status >= 200 && log.status < 300
                                          ? 'bg-emerald-500/10 text-emerald-400'
                                          : log.status >= 400
                                          ? 'bg-rose-500/10 text-rose-400'
                                          : 'bg-amber-500/10 text-amber-400'
                                      }`}
                                    >
                                      {log.status} {log.statusText}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="w-14 font-bold text-slate-200">{lat} ms</span>
                                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-1.5 rounded-full ${meterColor}`} style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-[10px] text-slate-400">
                                    <span className="text-sky-400">DNS:{log.timings?.dns || 0}ms</span> |{' '}
                                    <span className="text-amber-400">TTFB:{log.timings?.ttfb || 0}ms</span>
                                  </td>
                                  <td className="p-3 font-sans text-slate-300 text-xs">
                                    {log.userId?.name || 'Guest / Studio'}
                                  </td>
                                  <td className="p-3 text-slate-500 text-[10px]">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB 1: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Search Bar */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{filteredUsers.length} matching</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[10px] uppercase font-semibold border-b ${isDark ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Collections</th>
                        <th className="p-3.5">Executions</th>
                        <th className="p-3.5">Joined</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                          <td className="p-3.5 font-medium flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                            {user?._id === u._id && (
                              <span className="text-[10px] text-sky-400 font-normal">(You)</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">{u.email}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
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
                          <td className="p-3.5 text-slate-400">{u.collectionsCount || 0}</td>
                          <td className="p-3.5 text-slate-400">{u.executionsCount || 0}</td>
                          <td className="p-3.5 text-slate-500 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toggleUserRole(u._id, u.role)}
                                disabled={user?._id === u._id}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[11px] transition"
                                title="Promote or Demote Role"
                              >
                                {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => toggleUserStatus(u._id, u.status)}
                                disabled={user?._id === u._id}
                                className={`p-1 rounded transition ${
                                  u.status === 'active'
                                    ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400'
                                }`}
                                title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                              >
                                {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => deleteUser(u._id)}
                                disabled={user?._id === u._id}
                                className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition disabled:opacity-30"
                                title="Delete user account"
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
            )}

            {/* TAB 2: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">System Execution Audit Trail</h3>
                    <p className="text-[11px] text-slate-400">Chronological history of API executions across all user accounts</p>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Logs</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[10px] uppercase font-semibold border-b ${isDark ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      <tr>
                        <th className="p-3">Method</th>
                        <th className="p-3">Endpoint URL</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Latency</th>
                        <th className="p-3">Initiated By</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-[11px] ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                            No request history logged yet. Send requests from the Studio to populate audit telemetry.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log._id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                            <td className="p-3 font-bold text-sky-400">{log.method}</td>
                            <td className="p-3 text-slate-300 truncate max-w-xs">{log.url}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status >= 200 && log.status < 300
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : log.status >= 400
                                    ? 'bg-rose-500/10 text-rose-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}
                              >
                                {log.status} {log.statusText}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">{log.responseTime}ms</td>
                            <td className="p-3 font-sans text-slate-300">
                              {log.userId?.name || 'Guest / Automated'}
                            </td>
                            <td className="p-3 text-slate-500 text-[10px]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM HEALTH */}
            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-6 rounded-xl border space-y-4 ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    <span>Core Platform Telemetry</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Backend Server Engine</span>
                      <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online (Node.js + Express 5)
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Database Engine</span>
                      <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        MongoDB Connected
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Proxy Engine</span>
                      <span className="font-mono font-semibold text-sky-400">CORS Tunnel Active</span>
                    </div>

                    <div className="flex justify-between pb-1">
                      <span className="text-slate-400">Mock Data Endpoint</span>
                      <span className="font-mono text-purple-400">/api/mock/users (Ready)</span>
                    </div>
                  </div>
                </div>

                {/* HTTP Status Code Distribution */}
                {stats?.statusCodes && (
                  <div
                    className={`p-6 rounded-xl border space-y-4 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <span>HTTP Response Distribution</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-emerald-400 font-semibold">2xx Success Responses</span>
                          <span>{stats.statusCodes['2xx'] || 0}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((stats.statusCodes['2xx'] || 0) / (stats.totalExecutions || 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-rose-400 font-semibold">4xx / 5xx Client & Server Errors</span>
                          <span>{(stats.statusCodes['4xx'] || 0) + (stats.statusCodes['5xx'] || 0)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-rose-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (((stats.statusCodes['4xx'] || 0) + (stats.statusCodes['5xx'] || 0)) /
                                  (stats.totalExecutions || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* CREATE NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span>Create New User Account</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addUserError && (
              <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
                {addUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {addUserLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

