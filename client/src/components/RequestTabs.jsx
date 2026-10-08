import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Key,
  Shield,
  FileText,
  CheckCircle2,
  Sparkles,
  AlignLeft,
} from 'lucide-react';

export const RequestTabs = () => {
  const { activeRequest, setActiveRequest, activeTab, setActiveTab } = useApi();

  // Helper to update Key-Value lists (params, headers)
  const updateListRow = (listName, index, field, value) => {
    setActiveRequest((prev) => {
      const list = [...(prev[listName] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [listName]: list };
    });
  };

  const addListRow = (listName) => {
    setActiveRequest((prev) => ({
      ...prev,
      [listName]: [...(prev[listName] || []), { key: '', value: '', enabled: true, description: '' }],
    }));
  };

  const removeListRow = (listName, index) => {
    setActiveRequest((prev) => {
      const list = [...(prev[listName] || [])];
      list.splice(index, 1);
      return { ...prev, [listName]: list };
    });
  };

  // Format JSON body
  const beautifyJsonBody = () => {
    try {
      const parsed = JSON.parse(activeRequest.rawBody);
      setActiveRequest((prev) => ({ ...prev, rawBody: JSON.stringify(parsed, null, 2) }));
    } catch (_) {
      alert('Current body is not valid JSON.');
    }
  };

  // Add sample JSON
  const insertJsonSample = () => {
    const sample = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Platform Engineer',
      skills: ['TypeScript', 'Node.js', 'MongoDB', 'Docker'],
      isActive: true,
    };
    setActiveRequest((prev) => ({
      ...prev,
      bodyType: 'json',
      rawBody: JSON.stringify(sample, null, 2),
    }));
  };

  // Add sample XML
  const insertXmlSample = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <user>
    <name>Jane Doe</name>
    <role>Platform Engineer</role>
    <department>DevOps</department>
  </user>
</request>`;
    setActiveRequest((prev) => ({
      ...prev,
      bodyType: 'xml',
      rawBody: xml,
    }));
  };

  // Automated Tests Helpers
  const addTestCase = (type = 'status', expectedValue = '200', name = 'Status is 200') => {
    setActiveRequest((prev) => ({
      ...prev,
      testCases: [
        ...(prev.testCases || []),
        {
          id: 'test-' + Date.now(),
          name,
          type,
          expectedValue,
          enabled: true,
        },
      ],
    }));
  };

  const updateTestCase = (index, field, value) => {
    setActiveRequest((prev) => {
      const tests = [...(prev.testCases || [])];
      tests[index] = { ...tests[index], [field]: value };
      return { ...prev, testCases: tests };
    });
  };

  const removeTestCase = (index) => {
    setActiveRequest((prev) => {
      const tests = [...(prev.testCases || [])];
      tests.splice(index, 1);
      return { ...prev, testCases: tests };
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      {/* Sub Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-2 sm:px-3 text-xs font-medium shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('params')}
          className={`py-2 px-2.5 sm:px-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'params'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Params
          {(activeRequest.params || []).filter((p) => p.enabled && p.key).length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300">
              {(activeRequest.params || []).filter((p) => p.enabled && p.key).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 px-2.5 sm:px-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'headers'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Headers
          {(activeRequest.headers || []).filter((h) => h.enabled && h.key).length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300">
              {(activeRequest.headers || []).filter((h) => h.enabled && h.key).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`py-2 px-2.5 sm:px-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'auth'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Authorization
          {activeRequest.auth?.type !== 'none' && (
            <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('body')}
          className={`py-2 px-2.5 sm:px-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'body'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Body
          {activeRequest.bodyType !== 'none' && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 uppercase">
              {activeRequest.bodyType}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2 px-2.5 sm:px-3 border-b-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'tests'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tests / Assertions
          {(activeRequest.testCases || []).length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-mono">
              {(activeRequest.testCases || []).length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* TAB 1: PARAMS */}
        {activeTab === 'params' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Query Parameters</span>
              <button
                onClick={() => addListRow('params')}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Param
              </button>
            </div>

            <table className="w-full text-xs text-left border border-slate-800 rounded-md overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-10 text-center">Active</th>
                  <th className="p-2 w-1/3">Key</th>
                  <th className="p-2 w-1/3">Value</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {(activeRequest.params || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => updateListRow('params', idx, 'enabled', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => updateListRow('params', idx, 'key', e.target.value)}
                        placeholder="Parameter Name"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => updateListRow('params', idx, 'value', e.target.value)}
                        placeholder="Value (e.g. {{userId}})"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.description || ''}
                        onChange={(e) => updateListRow('params', idx, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() => removeListRow('params', idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => addListRow('params')}
              className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1.5 py-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add parameter row
            </button>
          </div>
        )}

        {/* TAB 2: HEADERS */}
        {activeTab === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Custom Request Headers</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addListRow('headers')}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Header
                </button>
              </div>
            </div>

            <table className="w-full text-xs text-left border border-slate-800 rounded-md overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-10 text-center">Active</th>
                  <th className="p-2 w-1/3">Header Name</th>
                  <th className="p-2 w-1/3">Header Value</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {(activeRequest.headers || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) => updateListRow('headers', idx, 'enabled', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => updateListRow('headers', idx, 'key', e.target.value)}
                        placeholder="e.g. Content-Type, Accept, X-API-Key"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => updateListRow('headers', idx, 'value', e.target.value)}
                        placeholder="Value (e.g. application/json, {{apiKey}})"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.description || ''}
                        onChange={(e) => updateListRow('headers', idx, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() => removeListRow('headers', idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span>Quick add common headers:</span>
              <button
                onClick={() => {
                  setActiveRequest((prev) => ({
                    ...prev,
                    headers: [...(prev.headers || []), { key: 'Content-Type', value: 'application/json', enabled: true }],
                  }));
                }}
                className="hover:text-sky-400 underline"
              >
                + Content-Type: JSON
              </button>
              <button
                onClick={() => {
                  setActiveRequest((prev) => ({
                    ...prev,
                    headers: [...(prev.headers || []), { key: 'Accept', value: 'application/json', enabled: true }],
                  }));
                }}
                className="hover:text-sky-400 underline"
              >
                + Accept: JSON
              </button>
              <button
                onClick={() => {
                  setActiveRequest((prev) => ({
                    ...prev,
                    headers: [...(prev.headers || []), { key: 'X-API-Key', value: '{{apiKey}}', enabled: true }],
                  }));
                }}
                className="hover:text-sky-400 underline"
              >
                + X-API-Key
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AUTHORIZATION */}
        {activeTab === 'auth' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authentication Scheme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'none', label: 'No Auth' },
                  { id: 'bearer', label: 'Bearer Token' },
                  { id: 'basic', label: 'Basic Auth' },
                  { id: 'apiKey', label: 'API Key' },
                  { id: 'oauth2', label: 'OAuth 2.0' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setActiveRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, type: type.id },
                      }))
                    }
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-center transition ${
                      activeRequest.auth?.type === type.id
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bearer Token Form */}
            {activeRequest.auth?.type === 'bearer' && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Key className="w-4 h-4 text-sky-400" />
                  <span>Bearer Token Configuration</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Token string or variable</label>
                  <input
                    type="text"
                    value={activeRequest.auth?.token || ''}
                    onChange={(e) =>
                      setActiveRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, token: e.target.value },
                      }))
                    }
                    placeholder="e.g. eyJhbGciOi... or {{token}}"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automatically sent in the <code>Authorization: Bearer &lt;token&gt;</code> request header.
                  </p>
                </div>
              </div>
            )}

            {/* Basic Auth Form */}
            {activeRequest.auth?.type === 'basic' && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Basic Authentication</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.username || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, username: e.target.value },
                        }))
                      }
                      placeholder="Username or {{username}}"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Password</label>
                    <input
                      type="password"
                      value={activeRequest.auth?.password || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, password: e.target.value },
                        }))
                      }
                      placeholder="Password"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Encoded into Base64 and sent in <code>Authorization: Basic ...</code>.
                </p>
              </div>
            )}

            {/* API Key Form */}
            {activeRequest.auth?.type === 'apiKey' && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>API Key Configuration</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Key Name</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.key || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, key: e.target.value },
                        }))
                      }
                      placeholder="e.g. X-API-KEY or api_token"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Key Value</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.value || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, value: e.target.value },
                        }))
                      }
                      placeholder="e.g. secret_key or {{apiKey}}"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Add To</label>
                  <select
                    value={activeRequest.auth?.addTo || 'header'}
                    onChange={(e) =>
                      setActiveRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, addTo: e.target.value },
                      }))
                    }
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="header">Request Headers</option>
                    <option value="query">Query Parameters</option>
                  </select>
                </div>
              </div>
            )}

            {/* OAuth 2.0 Form */}
            {activeRequest.auth?.type === 'oauth2' && (
              <div className="space-y-3.5 p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span>OAuth 2.0 Authorization</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: 'user_123', scope: 'read:all write:all', exp: Math.floor(Date.now() / 1000) + 3600 })) + '.simulatedSignature';
                      setActiveRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, oauth2Token: mockToken, token: mockToken },
                      }));
                    }}
                    className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-medium transition"
                  >
                    Generate Mock Token
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Grant Type</label>
                    <select
                      value={activeRequest.auth?.oauth2GrantType || 'client_credentials'}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, oauth2GrantType: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="client_credentials">Client Credentials</option>
                      <option value="authorization_code">Authorization Code</option>
                      <option value="password">Password Credentials</option>
                      <option value="implicit">Implicit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Header Prefix</label>
                    <input
                      type="text"
                      defaultValue="Bearer"
                      disabled
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1.5 text-xs text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Access Token (or {{token}} variable)</label>
                  <input
                    type="text"
                    value={activeRequest.auth?.oauth2Token || activeRequest.auth?.token || ''}
                    onChange={(e) =>
                      setActiveRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, oauth2Token: e.target.value, token: e.target.value },
                      }))
                    }
                    placeholder="eyJhbGciOi... or {{oauth_token}}"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Token Request URL (Optional)</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.oauth2TokenUrl || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, oauth2TokenUrl: e.target.value },
                        }))
                      }
                      placeholder="https://auth.example.com/oauth/token"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Scope</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.oauth2Scope || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, oauth2Scope: e.target.value },
                        }))
                      }
                      placeholder="e.g. read:users write:orders"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Client ID</label>
                    <input
                      type="text"
                      value={activeRequest.auth?.oauth2ClientId || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, oauth2ClientId: e.target.value },
                        }))
                      }
                      placeholder="client_id_here"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={activeRequest.auth?.oauth2ClientSecret || ''}
                      onChange={(e) =>
                        setActiveRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, oauth2ClientSecret: e.target.value },
                        }))
                      }
                      placeholder="client_secret_here"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Token is automatically injected into the <code>Authorization: Bearer &lt;token&gt;</code> request header.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BODY */}
        {activeTab === 'body' && (
          <div className="space-y-3 h-full flex flex-col">
            {/* Body Type Selectors */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                {[
                  { id: 'none', label: 'none' },
                  { id: 'json', label: 'JSON' },
                  { id: 'xml', label: 'XML' },
                  { id: 'form-data', label: 'form-data' },
                  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                  { id: 'raw', label: 'raw text' },
                  { id: 'binary', label: 'binary' },
                ].map((b) => (
                  <label key={b.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="bodyType"
                      checked={activeRequest.bodyType === b.id}
                      onChange={() => setActiveRequest((prev) => ({ ...prev, bodyType: b.id }))}
                      className="text-sky-500 focus:ring-0 cursor-pointer"
                    />
                    <span className={activeRequest.bodyType === b.id ? 'text-sky-400 font-semibold' : ''}>
                      {b.label}
                    </span>
                  </label>
                ))}
              </div>

              {activeRequest.bodyType === 'json' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={insertJsonSample}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition"
                  >
                    <Sparkles className="w-3 h-3" /> Insert Sample
                  </button>
                  <button
                    onClick={beautifyJsonBody}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium transition"
                  >
                    <AlignLeft className="w-3 h-3" /> Beautify JSON
                  </button>
                </div>
              )}

              {activeRequest.bodyType === 'xml' && (
                <button
                  onClick={insertXmlSample}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition"
                >
                  <Sparkles className="w-3 h-3" /> Insert Sample XML
                </button>
              )}
            </div>

            {/* None notice */}
            {activeRequest.bodyType === 'none' && (
              <div className="text-center py-12 text-slate-500 text-xs">
                This request does not have a body.
              </div>
            )}

            {/* JSON / XML / RAW Editor */}
            {['json', 'xml', 'raw'].includes(activeRequest.bodyType) && (
              <div className="flex-1 flex flex-col border border-slate-800 rounded-md overflow-hidden bg-slate-950">
                <textarea
                  value={activeRequest.rawBody || ''}
                  onChange={(e) => setActiveRequest((prev) => ({ ...prev, rawBody: e.target.value }))}
                  placeholder={`Enter ${activeRequest.bodyType.toUpperCase()} body here...`}
                  rows={10}
                  className="w-full h-full p-3 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Form Data & URL-Encoded Table */}
            {['form-data', 'x-www-form-urlencoded'].includes(activeRequest.bodyType) && (
              <div className="space-y-2">
                <table className="w-full text-xs text-left border border-slate-800 rounded-md overflow-hidden">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-2 w-10 text-center">Active</th>
                      <th className="p-2 w-1/4">Key</th>
                      {activeRequest.bodyType === 'form-data' && <th className="p-2 w-20">Type</th>}
                      <th className="p-2 w-1/3">Value</th>
                      <th className="p-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                    {(activeRequest.formData || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            onChange={(e) => {
                              const list = [...(activeRequest.formData || [])];
                              list[idx].enabled = e.target.checked;
                              setActiveRequest((prev) => ({ ...prev, formData: list }));
                            }}
                            className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.key}
                            onChange={(e) => {
                              const list = [...(activeRequest.formData || [])];
                              list[idx].key = e.target.value;
                              setActiveRequest((prev) => ({ ...prev, formData: list }));
                            }}
                            placeholder="Field Key"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                          />
                        </td>
                        {activeRequest.bodyType === 'form-data' && (
                          <td className="p-1">
                            <select
                              value={row.type || 'text'}
                              onChange={(e) => {
                                const list = [...(activeRequest.formData || [])];
                                list[idx].type = e.target.value;
                                setActiveRequest((prev) => ({ ...prev, formData: list }));
                              }}
                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-sky-500"
                            >
                              <option value="text">Text</option>
                              <option value="file">File</option>
                            </select>
                          </td>
                        )}
                        <td className="p-1">
                          {row.type === 'file' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id={`file-input-${idx}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const list = [...(activeRequest.formData || [])];
                                    list[idx].value = file.name;
                                    setActiveRequest((prev) => ({ ...prev, formData: list }));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`file-input-${idx}`}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs cursor-pointer border border-slate-700 truncate max-w-xs block"
                              >
                                {row.value ? `📎 ${row.value}` : 'Choose File...'}
                              </label>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={row.value}
                              onChange={(e) => {
                                const list = [...(activeRequest.formData || [])];
                                list[idx].value = e.target.value;
                                setActiveRequest((prev) => ({ ...prev, formData: list }));
                              }}
                              placeholder="Field Value"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                            />
                          )}
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => {
                              const list = [...(activeRequest.formData || [])];
                              list.splice(idx, 1);
                              setActiveRequest((prev) => ({ ...prev, formData: list }));
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={() => {
                    setActiveRequest((prev) => ({
                      ...prev,
                      formData: [...(prev.formData || []), { key: '', value: '', type: 'text', enabled: true }],
                    }));
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add form parameter
                </button>
              </div>
            )}

            {/* Binary Body Upload */}
            {activeRequest.bodyType === 'binary' && (
              <div className="p-6 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/40 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Select Binary Payload</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Upload an image, audio, PDF, or binary data file to transmit</p>
                </div>
                <input
                  type="file"
                  id="binary-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setActiveRequest((prev) => ({
                          ...prev,
                          rawBody: event.target.result,
                          binaryFileName: file.name,
                          binaryFileSize: file.size,
                        }));
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <label
                  htmlFor="binary-file-upload"
                  className="inline-block px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer shadow-md transition"
                >
                  Choose Binary File
                </label>
                {activeRequest.binaryFileName && (
                  <div className="text-[11px] font-mono text-emerald-400 mt-2">
                    Selected: {activeRequest.binaryFileName} ({Math.round(activeRequest.binaryFileSize / 1024)} KB)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TESTS & ASSERTIONS */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <h3 className="font-semibold text-slate-200">Automated API Test Assertions</h3>
                <p className="text-slate-400 text-[11px]">
                  These assertions run automatically on response receipt.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => addTestCase('status', '200', 'Status is 200 OK')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                >
                  + Status 200
                </button>
                <button
                  onClick={() => addTestCase('status', '201', 'Status is 201 Created')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                >
                  + Status 201
                </button>
                <button
                  onClick={() => addTestCase('responseTime', '500', 'Response time < 500ms')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                >
                  + Latency &lt; 500ms
                </button>
                <button
                  onClick={() => addTestCase('jsonProp', 'success', 'JSON has "success"')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
                >
                  + JSON Prop
                </button>
              </div>
            </div>

            {/* Test Cases Table */}
            <table className="w-full text-xs text-left border border-slate-800 rounded-md overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-10 text-center">Run</th>
                  <th className="p-2 w-1/3">Test Name</th>
                  <th className="p-2 w-1/4">Assertion Type</th>
                  <th className="p-2">Expected Value / Expression</th>
                  <th className="p-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {(activeRequest.testCases || []).map((tc, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={tc.enabled}
                        onChange={(e) => updateTestCase(idx, 'enabled', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={tc.name}
                        onChange={(e) => updateTestCase(idx, 'name', e.target.value)}
                        placeholder="Test Description"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={tc.type}
                        onChange={(e) => updateTestCase(idx, 'type', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="status">Status code equals</option>
                        <option value="responseTime">Response time is less than (ms)</option>
                        <option value="jsonProp">JSON property exists (path)</option>
                        <option value="containsText">Body contains substring</option>
                        <option value="headerExists">Response header exists</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={tc.expectedValue || ''}
                        onChange={(e) => updateTestCase(idx, 'expectedValue', e.target.value)}
                        placeholder="e.g. 200, 500, data.id, application/json"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() => removeTestCase(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove assertion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => addTestCase('status', '200', 'Status is 200')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add custom assertion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

