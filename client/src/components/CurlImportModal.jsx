import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { parseCurlCommand } from '../utils/curlParser';
import { Terminal, X, Check, AlertCircle, Sparkles, ArrowRight, Copy } from 'lucide-react';
import { getMethodColor } from '../utils/formatters';

export const CurlImportModal = ({ isOpen, onClose }) => {
  const { setActiveRequest, setActiveTab } = useApi();
  const [curlInput, setCurlInput] = useState('');
  const [error, setError] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  if (!isOpen) return null;

  const samples = [
    {
      label: 'POST JSON (Users API)',
      cmd: `curl -X POST https://jsonplaceholder.typicode.com/users \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "role": "FullStack Engineer"}'`,
    },
    {
      label: 'GET Bearer Auth API',
      cmd: `curl -X GET https://httpbin.org/bearer \\
  -H "Authorization: Bearer my-secret-jwt-token-12345" \\
  -H "Accept: application/json"`,
    },
    {
      label: 'GET GitHub Commits',
      cmd: `curl -X GET "https://api.github.com/repos/facebook/react/commits?per_page=5&page=1" \\
  -H "User-Agent: APITester-Studio" \\
  -H "Accept: application/vnd.github.v3+json"`,
    },
    {
      label: 'PUT Update Mock Endpoint',
      cmd: `curl -X PUT http://localhost:5000/api/mock/users/1 \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice Walker", "role": "Lead Architect", "status": "active"}'`,
    },
  ];

  const handleTextChange = (text) => {
    setCurlInput(text);
    setError('');
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      const parsed = parseCurlCommand(text);
      setParsedPreview(parsed);
    } catch (err) {
      setParsedPreview(null);
    }
  };

  const handleApply = () => {
    if (!curlInput.trim()) {
      setError('Please enter or paste a cURL command.');
      return;
    }

    try {
      const parsed = parseCurlCommand(curlInput);

      setActiveRequest((prev) => ({
        ...prev,
        _id: null,
        name: `Imported cURL (${parsed.method} ${parsed.url.split('/').pop() || 'Request'})`,
        method: parsed.method,
        url: parsed.url,
        params: parsed.params.length > 0 ? parsed.params : prev.params,
        headers: parsed.headers.length > 0 ? parsed.headers : prev.headers,
        auth: parsed.auth.type !== 'none' ? parsed.auth : prev.auth,
        bodyType: parsed.bodyType,
        rawBody: parsed.rawBody || '',
        testCases: [
          {
            id: 'test-' + Date.now(),
            name: `Status is 200 OK`,
            type: 'status',
            expectedValue: '200',
            enabled: true,
          },
          {
            id: 'test-lat-' + Date.now(),
            name: `Response under 2000ms`,
            type: 'responseTime',
            expectedValue: '2000',
            enabled: true,
          },
        ],
      }));

      if (parsed.bodyType !== 'none') {
        setActiveTab('body');
      } else if (parsed.params.length > 0) {
        setActiveTab('params');
      } else if (parsed.headers.length > 0) {
        setActiveTab('headers');
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to parse cURL command.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Import cURL Command</h3>
              <p className="text-[11px] text-slate-400">
                Paste any raw cURL from your terminal, browser DevTools, or documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> Presets:
          </span>
          {samples.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTextChange(s.cmd)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 font-medium text-[11px] whitespace-nowrap transition cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                Paste cURL Script
              </label>
              {curlInput && (
                <button
                  type="button"
                  onClick={() => handleTextChange('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  Clear input
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={curlInput}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`curl -X POST https://api.example.com/v1/items \\
  -H 'Authorization: Bearer token123' \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Widget","price":29.99}'`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl p-3 font-mono text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Live Preview */}
          {parsedPreview && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Parsed Output Preview
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Valid cURL Syntax
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getMethodColor(parsedPreview.method)}`}>
                  {parsedPreview.method}
                </span>
                <span className="text-xs font-mono text-slate-200 truncate flex-1">
                  {parsedPreview.url}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-400">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase">Headers</span>
                  <span className="text-slate-200 font-bold">{parsedPreview.headers.length} detected</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase">Query Params</span>
                  <span className="text-slate-200 font-bold">{parsedPreview.params.length} detected</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase">Body Type</span>
                  <span className="text-amber-300 font-bold uppercase">{parsedPreview.bodyType}</span>
                </div>
              </div>

              {parsedPreview.rawBody && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Payload Snippet:</span>
                  <pre className="mt-1 p-2 bg-slate-900/90 rounded border border-slate-800/80 font-mono text-[10px] text-slate-300 max-h-20 overflow-y-auto whitespace-pre-wrap">
                    {parsedPreview.rawBody}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!curlInput.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Import into Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
