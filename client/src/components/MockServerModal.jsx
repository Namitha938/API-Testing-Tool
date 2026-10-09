import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { getMethodColor, getStatusColor } from '../utils/formatters';
import {
  Server,
  X,
  Play,
  ArrowRight,
  Database,
  Clock,
  Shield,
  FileCode,
  Sparkles,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const MockServerModal = ({ isOpen, onClose }) => {
  const { setActiveRequest, sendRequest, setActiveTab } = useApi();
  const [activeTab, setActiveTabState] = useState('endpoints'); // 'endpoints', 'liveData', 'statusSim'
  const [mockUsers, setMockUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [customStatusCode, setCustomStatusCode] = useState('418');
  const [simulatedDelay, setSimulatedDelay] = useState(1200);

  const mockEndpoints = [
    {
      category: 'Users CRUD',
      method: 'GET',
      path: '/api/mock/users?page=1&limit=5',
      name: 'List Mock Users (Paginated & Filterable)',
      desc: 'Returns a paginated list of mock users. Supports ?page=1&limit=5&search=alice',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Users CRUD',
      method: 'POST',
      path: '/api/mock/users',
      name: 'Create Mock User',
      desc: 'Creates a new user record in the in-memory mock store and returns HTTP 201 Created.',
      bodyType: 'json',
      body: JSON.stringify(
        {
          name: 'Sarah Connor',
          email: 'sarah@cyberdyne.org',
          role: 'Security Specialist',
          department: 'CyberSecurity',
        },
        null,
        2
      ),
    },
    {
      category: 'Users CRUD',
      method: 'GET',
      path: '/api/mock/users/1',
      name: 'Get Mock User by ID',
      desc: 'Retrieves user #1 details or 404 if not found.',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Users CRUD',
      method: 'PUT',
      path: '/api/mock/users/1',
      name: 'Replace Mock User (PUT)',
      desc: 'Replaces user with id 1 with updated parameters.',
      bodyType: 'json',
      body: JSON.stringify(
        {
          name: 'Alice Walker Updated',
          email: 'alice.updated@example.com',
          role: 'Principal Architect',
        },
        null,
        2
      ),
    },
    {
      category: 'Users CRUD',
      method: 'DELETE',
      path: '/api/mock/users/1',
      name: 'Delete Mock User (DELETE)',
      desc: 'Removes mock user by ID and returns deleted confirmation payload.',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Advanced Scenarios',
      method: 'GET',
      path: '/api/mock/xml',
      name: 'XML Response Payload',
      desc: 'Returns XML application/xml payload with nested data elements.',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Advanced Scenarios',
      method: 'GET',
      path: '/api/mock/delayed?ms=1500',
      name: 'Network Latency & Timeout Simulator',
      desc: 'Simulates a slow backend service by introducing configurable delay (e.g. 1500ms).',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Advanced Scenarios',
      method: 'GET',
      path: '/api/mock/auth-protected',
      name: 'Bearer Token Auth Challenge',
      desc: 'Simulates API security: returns 401 Unauthorized unless Bearer "test-secret-token" is sent.',
      authHeader: 'Bearer test-secret-token',
      bodyType: 'none',
      body: '',
    },
    {
      category: 'Advanced Scenarios',
      method: 'POST',
      path: '/api/mock/echo',
      name: 'Request Echo Inspector',
      desc: 'Reflects the exact HTTP method, headers, query parameters, and body back to the caller.',
      bodyType: 'json',
      body: JSON.stringify(
        {
          client: 'APITester Studio',
          timestamp: new Date().toISOString(),
          testPayload: 'Echo test data payload',
        },
        null,
        2
      ),
    },
  ];

  const fetchLiveMockUsers = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/mock/users');
      if (res.ok) {
        const data = await res.json();
        setMockUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch mock data', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveMockUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoadEndpoint = (endpoint) => {
    const fullUrl = `http://localhost:5000${endpoint.path}`;
    const headers = [];
    const auth = {
      type: 'none',
      token: '',
      username: '',
      password: '',
      key: '',
      value: '',
      addTo: 'header',
    };

    if (endpoint.authHeader) {
      auth.type = 'bearer';
      auth.token = 'test-secret-token';
      headers.push({
        key: 'Authorization',
        value: endpoint.authHeader,
        enabled: true,
        description: 'Mock Bearer Token',
      });
    }

    if (endpoint.bodyType === 'json') {
      headers.push({
        key: 'Content-Type',
        value: 'application/json',
        enabled: true,
        description: '',
      });
    }

    setActiveRequest({
      _id: null,
      name: `Mock: ${endpoint.name}`,
      method: endpoint.method,
      url: fullUrl,
      params: [],
      headers,
      auth,
      bodyType: endpoint.bodyType || 'none',
      rawBody: endpoint.body || '',
      testCases: [
        {
          id: 'mock-t1',
          name: 'Status is 200 or 201',
          type: 'status',
          expectedValue: endpoint.method === 'POST' ? '201' : '200',
          enabled: true,
        },
        {
          id: 'mock-t2',
          name: 'Response time under 2000ms',
          type: 'responseTime',
          expectedValue: '2000',
          enabled: true,
        },
      ],
    });

    if (endpoint.bodyType !== 'none') {
      setActiveTab('body');
    }

    onClose();
  };

  const handleLoadCustomStatus = (code) => {
    const fullUrl = `http://localhost:5000/api/mock/status/${code}`;
    setActiveRequest({
      _id: null,
      name: `Mock Status Code ${code}`,
      method: 'GET',
      url: fullUrl,
      params: [],
      headers: [],
      auth: { type: 'none' },
      bodyType: 'none',
      rawBody: '',
      testCases: [
        {
          id: 'mock-status-t1',
          name: `Status code matches ${code}`,
          type: 'status',
          expectedValue: code.toString(),
          enabled: true,
        },
      ],
    });
    onClose();
  };

  const handleLoadDelayed = () => {
    const fullUrl = `http://localhost:5000/api/mock/delayed?ms=${simulatedDelay}`;
    setActiveRequest({
      _id: null,
      name: `Mock Latency Test (${simulatedDelay}ms)`,
      method: 'GET',
      url: fullUrl,
      params: [],
      headers: [],
      auth: { type: 'none' },
      bodyType: 'none',
      rawBody: '',
      testCases: [
        {
          id: 'mock-delay-t1',
          name: 'Status is 200 OK',
          type: 'status',
          expectedValue: '200',
          enabled: true,
        },
        {
          id: 'mock-delay-t2',
          name: `Response time approximately ${simulatedDelay}ms`,
          type: 'responseTime',
          expectedValue: `${parseInt(simulatedDelay) + 500}`,
          enabled: true,
        },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm">Mock Server Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Running on Port 5000
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instant zero-setup sandbox for rapid prototyping, schema verification, and latency testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 font-medium text-xs">
          <button
            onClick={() => setActiveTabState('endpoints')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Mock Endpoints ({mockEndpoints.length})</span>
          </button>

          <button
            onClick={() => setActiveTabState('liveData')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'liveData'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Live Mock Database</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
              {mockUsers.length} records
            </span>
          </button>

          <button
            onClick={() => setActiveTabState('statusSim')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'statusSim'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Status Code & Delay Simulator</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: MOCK ENDPOINTS LIST */}
          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodColor(ep.method)}`}>
                          {ep.method}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {ep.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                        {ep.name}
                      </h4>
                      <div className="text-[11px] font-mono text-slate-400 truncate mt-1 bg-slate-900 px-2 py-1 rounded border border-slate-800/60">
                        {ep.path}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {ep.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {ep.bodyType !== 'none' ? 'Includes payload' : 'No body'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLoadEndpoint(ep)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <span>Load into Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE IN-MEMORY MOCK DATABASE */}
          {activeTab === 'liveData' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Live Mock Database Records</h4>
                  <p className="text-[11px] text-slate-400">
                    State persists in memory during your active server session. Test mutations via POST / PUT / DELETE.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchLiveMockUsers}
                  disabled={loadingData}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/70 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/30">
                        <td className="p-3 text-slate-500 font-bold">#{u.id}</td>
                        <td className="p-3 text-slate-200 font-sans font-medium">{u.name}</td>
                        <td className="p-3 text-sky-400">{u.email}</td>
                        <td className="p-3 text-slate-300 font-sans">{u.role}</td>
                        <td className="p-3 text-slate-400 font-sans">{u.department}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {mockUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No mock users in database. Create one using POST /api/mock/users.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STATUS CODE & DELAY SIMULATOR */}
          {activeTab === 'statusSim' && (
            <div className="space-y-6">
              {/* Status Code Simulator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Custom HTTP Status Code Generator</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Test how your frontend, error handlers, and retry policies behave when the backend returns specific HTTP status codes.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {[200, 201, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLoadCustomStatus(code)}
                      className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs transition cursor-pointer hover:scale-105 active:scale-95 ${getStatusColor(
                        code
                      )}`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-slate-400 font-medium">Or enter custom status:</label>
                  <input
                    type="number"
                    min="100"
                    max="599"
                    value={customStatusCode}
                    onChange={(e) => setCustomStatusCode(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono text-center focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleLoadCustomStatus(customStatusCode)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition cursor-pointer"
                  >
                    Load Status {customStatusCode}
                  </button>
                </div>
              </div>

              {/* Latency Simulator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Artificial Backend Latency / Delay Simulator</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Inject artificial server-side delay to test loading skeletons, timeouts, and SLA performance assertions.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={simulatedDelay}
                    onChange={(e) => setSimulatedDelay(e.target.value)}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-sky-400 w-20 text-right">
                    {simulatedDelay} ms
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDelayed}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition cursor-pointer"
                  >
                    Test {simulatedDelay}ms Delay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-slate-400 text-[11px]">
          <span>Pro tip: Combine mock endpoints with Collection Runner to simulate real microservices test suites.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
