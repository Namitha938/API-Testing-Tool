import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  BarChart3,
  TrendingUp,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const { token, user: currentUser, adminToken, adminUser, loginAdminWithGoogle, logoutAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' or 'users'
  const [perfFilter, setPerfFilter] = useState('all'); // 'all', 'success', 'errors', 'slow'
  const [selectedLog, setSelectedLog] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Use dedicated adminToken from sessionStorage, or fall back to token if the normal user is already an authorized admin
  const isNormalUserAdmin = currentUser?.role === 'admin' && ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com'].includes((currentUser?.email || '').toLowerCase().replace(/\s+/g, '').trim());
  const effectiveAdminToken = adminToken || (isNormalUserAdmin ? token : null);
  const isDashboardAdmin = Boolean(effectiveAdminToken);

  const fetchAdminData = async () => {
    if (!effectiveAdminToken) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${effectiveAdminToken}` };
      const [statsRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/history', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isDashboardAdmin) fetchAdminData();
  }, [isOpen, effectiveAdminToken, isDashboardAdmin]);

  const handleGoogleAdminLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      // Authenticates admin independently without changing normal dashboard user
      await loginAdminWithGoogle();
      fetchAdminData();
    } catch (err) {
      setLoginError(err.message || 'Google authentication failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${effectiveAdminToken}` },
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${effectiveAdminToken}` },
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
        headers: { Authorization: `Bearer ${effectiveAdminToken}` },
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  if (!isDashboardAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/30 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase font-mono">
            Administrator Access Required
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard Login</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please continue with your authorized administrator Google account to access this console.
          </p>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleGoogleAdminLogin}
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{loginLoading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-pointer transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Administrator Console</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">System analytics, database stats & user access management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-lg hover:bg-slate-100 dark:hover:bg-purple-950/40 border border-slate-300 dark:border-slate-800 text-xs flex items-center gap-1 transition"
              title="Open Fullscreen Admin Page"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            {adminToken && (
              <button
                onClick={() => {
                  logoutAdmin();
                  onClose();
                }}
                className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-medium transition cursor-pointer"
                title="Lock Admin Console without logging out normal dashboard user"
              >
                Exit Admin
              </button>
            )}
            <button
              onClick={fetchAdminData}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 text-xs font-semibold gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'performance'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance & Latency</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              {auditLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              {users.length}
            </span>
          </button>
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

          {/* TAB 1: PERFORMANCE MONITORING */}
          {activeTab === 'performance' && (() => {
            const latencies = auditLogs.map((l) => l.responseTime || 0);
            const avgLatency = stats?.avgResponseTime || (latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0);
            const minLatency = latencies.length ? Math.min(...latencies) : 0;
            const maxLatency = latencies.length ? Math.max(...latencies) : 0;
            const sorted = [...latencies].sort((a, b) => a - b);
            const p50 = sorted.length ? sorted[Math.floor(sorted.length * 0.5)] : 0;
            const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;

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
                {/* Latency Percentile Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Average Latency</span>
                    <div className="text-xl font-bold font-mono text-purple-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>{avgLatency} ms</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Across {auditLogs.length} logged runs</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Fastest Request</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">{minLatency} ms</div>
                    <span className="text-[10px] text-emerald-500/80 mt-1 block">Min recorded round-trip</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Peak / Max Latency</span>
                    <div className="text-xl font-bold font-mono text-amber-400">{maxLatency} ms</div>
                    <span className="text-[10px] text-amber-500/80 mt-1 block">Max execution time</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">P50 (Median)</span>
                    <div className="text-xl font-bold font-mono text-sky-400">{p50} ms</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">50th percentile response</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">P95 Target</span>
                    <div className="text-xl font-bold font-mono text-rose-400">{p95} ms</div>
                    <span className="text-[10px] text-slate-500 mt-1 block">95th percentile SLA</span>
                  </div>
                </div>

                {/* SVG Response Time Timeline Chart */}
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span>Per-Request Response Time Timeline (ms)</span>
                      </h4>
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
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Clock className="w-8 h-8 mb-2 opacity-30" />
                      <p>No request latency data logged yet.</p>
                      <p className="text-[11px] text-slate-600 mt-1">Execute requests to populate the latency timeline.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44 select-none">
                        <defs>
                          <linearGradient id="modalLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

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

                        <line x1={padX} y1={padY + plotH} x2={chartW - padX} y2={padY + plotH} stroke="#475569" strokeWidth="1" />

                        {points.length > 1 && (
                          <polygon points={areaPoints} fill="url(#modalLatencyGradient)" />
                        )}

                        {points.length > 1 && (
                          <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" points={polylinePoints} />
                        )}

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
                              />
                              <title>{`${p.data.method} ${p.data.url}: ${p.data.responseTime}ms (${p.data.status})`}</title>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  {selectedLog && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-purple-500/30 flex items-center justify-between text-xs font-mono">
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

                {/* Per-Request Latency Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs text-slate-200">Per-Request Latency Telemetry</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {filteredLogs.length} Records
                      </span>
                    </div>

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
                          className={`px-2 py-1 rounded-md transition text-xs ${
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

                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="p-3">Method</th>
                          <th className="p-3">Endpoint</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 w-44">Response Time</th>
                          <th className="p-3">Timings Breakdown</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {filteredLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-900/40">
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-slate-200">
                                {log.method}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 truncate max-w-xs" title={log.url}>
                              {log.url}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status >= 200 && log.status < 300
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {log.status || 'ERR'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-purple-400 w-12 text-right">
                                  {log.responseTime}ms
                                </span>
                                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden w-20">
                                  <div
                                    className={`h-full rounded-full ${
                                      log.responseTime > 300
                                        ? 'bg-rose-500'
                                        : log.responseTime > 100
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min((log.responseTime / 500) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-[10px] text-slate-400">
                              DNS: {log.timings?.dns || 0}ms &bull; TCP: {log.timings?.tcp || 0}ms &bull; TTFB: {log.timings?.ttfb || 0}ms
                            </td>
                            <td className="p-3 text-slate-500 text-[10px]">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

