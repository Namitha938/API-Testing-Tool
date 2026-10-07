import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { getMethodColor } from '../utils/formatters';
import { Send, Save, Loader2, Sparkles, ChevronDown } from 'lucide-react';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const RequestPane = ({ onOpenSaveModal }) => {
  const {
    activeRequest,
    setActiveRequest,
    sendRequest,
    saveRequest,
    isLoading,
  } = useApi();

  const [nameEditing, setNameEditing] = useState(false);
  const [urlPresetsOpen, setUrlPresetsOpen] = useState(false);

  const handleMethodChange = (e) => {
    setActiveRequest((prev) => ({ ...prev, method: e.target.value }));
  };

  const handleUrlChange = (e) => {
    setActiveRequest((prev) => ({ ...prev, url: e.target.value }));
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      sendRequest();
    }
  };

  const mockPresets = [
    { label: 'GET Mock Users (List)', method: 'GET', url: 'http://localhost:5000/api/mock/users?page=1&limit=5' },
    { label: 'POST Create Mock User', method: 'POST', url: 'http://localhost:5000/api/mock/users' },
    { label: 'GET Mock User by ID', method: 'GET', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'PUT Update Mock User', method: 'PUT', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'DELETE Mock User', method: 'DELETE', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'GET XML Response Format', method: 'GET', url: 'http://localhost:5000/api/mock/xml' },
    { label: 'GET Delayed Latency (800ms)', method: 'GET', url: 'http://localhost:5000/api/mock/delayed?ms=800' },
    { label: 'GET Auth Protected (Bearer)', method: 'GET', url: 'http://localhost:5000/api/mock/auth-protected' },
    { label: 'GET Status Code 404', method: 'GET', url: 'http://localhost:5000/api/mock/status/404' },
    { label: 'GET Status Code 500', method: 'GET', url: 'http://localhost:5000/api/mock/status/500' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-3 shrink-0">
      {/* Request Name and Collection Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {nameEditing ? (
            <input
              type="text"
              value={activeRequest.name}
              onChange={(e) => setActiveRequest((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={() => setNameEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setNameEditing(false)}
              autoFocus
              className="bg-slate-800 text-slate-100 text-sm font-semibold px-2 py-0.5 rounded border border-sky-500 focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setNameEditing(true)}
              className="text-sm font-semibold text-slate-200 hover:text-sky-300 cursor-pointer flex items-center gap-1.5 transition"
              title="Click to rename request"
            >
              <span>{activeRequest.name || 'Untitled Request'}</span>
              <span className="text-[10px] text-slate-500 font-normal">✏️</span>
            </h2>
          )}

          {activeRequest._id ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Saved
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Unsaved
            </span>
          )}
        </div>

        {/* Quick Mock Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUrlPresetsOpen(!urlPresetsOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Load Quick Mock Endpoint</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {urlPresetsOpen && (
            <div
              className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-30 text-xs"
              onMouseLeave={() => setUrlPresetsOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Built-in Mock Endpoints
              </div>
              {mockPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveRequest((prev) => ({
                      ...prev,
                      name: preset.label,
                      method: preset.method,
                      url: preset.url,
                    }));
                    setUrlPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-slate-300 transition"
                >
                  <span className="truncate">{preset.label}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${getMethodColor(preset.method)}`}>
                    {preset.method}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Method + URL Input + Send / Save Bar */}
      <div className="flex items-center gap-2">
        {/* Method selector */}
        <div className="relative">
          <select
            value={activeRequest.method}
            onChange={handleMethodChange}
            className={`h-10 px-3 pr-8 rounded-lg font-bold text-xs border appearance-none focus:outline-none cursor-pointer tracking-wider font-mono ${getMethodColor(
              activeRequest.method
            )}`}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-slate-200">
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3.5 pointer-events-none opacity-60" />
        </div>

        {/* URL Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={activeRequest.url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter request URL (e.g. {{baseUrl}}/users or http://localhost:5000/api/mock/users)"
            className="w-full h-10 bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={sendRequest}
          disabled={isLoading || !activeRequest.url}
          className="h-10 px-5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-sky-600/20 active:scale-95"
          title="Send Request (Ctrl + Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-white" />
          )}
          <span>Send</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onOpenSaveModal}
          className="h-10 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition"
          title="Save request to collection"
        >
          <Save className="w-4 h-4 text-slate-400" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

