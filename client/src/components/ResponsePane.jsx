import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import {
  formatBytes,
  formatDuration,
  formatResponseBody,
  getStatusColor,
} from '../utils/formatters';
import {
  Copy,
  Check,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  BarChart3,
  Layers,
  FileCode,
  Zap,
} from 'lucide-react';

export const ResponsePane = () => {
  const { response, isLoading, responseTab, setResponseTab } = useApi();
  const [copied, setCopied] = useState(false);
  const [bodyFilter, setBodyFilter] = useState('');
  const [viewMode, setViewMode] = useState('pretty'); // 'pretty' or 'raw'

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 p-8 text-center text-xs">
        <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Sending request to proxy...</p>
        <p className="text-slate-500 text-[11px] mt-1">Measuring DNS, TTFB, and server round-trip latency</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 p-8 text-center text-xs select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
          <Zap className="w-6 h-6 text-sky-400 opacity-60" />
        </div>
        <p className="text-slate-300 font-medium">No response yet</p>
        <p className="text-slate-500 text-[11px] mt-1">
          Click <strong className="text-sky-400">Send</strong> or press <strong className="text-slate-300 font-mono">Ctrl + Enter</strong> to execute
        </p>
      </div>
    );
  }

  const formattedBody = formatResponseBody(response.responseBody, response.contentType);

  const handleCopyBody = () => {
    navigator.clipboard.writeText(response.responseBody || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-t border-slate-800">
      {/* Response Status Bar */}
      <div className="h-11 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 text-xs">
        {/* Status / Timing / Size badges */}
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded font-bold font-mono text-xs ${getStatusColor(response.status)}`}>
            {response.status || '0'} {response.statusText || 'Error'}
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDuration(response.responseTime)}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatBytes(response.responseSize)}</span>
          </div>

          {response.testResults?.length > 0 && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                response.failedCount === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {response.failedCount === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>
                Tests: {response.passedCount}/{response.testResults.length} Passed
              </span>
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopyBody}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          title="Copy response body"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Response Navigation Subtabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-3 text-xs font-medium justify-between items-center">
        <div className="flex">
          <button
            onClick={() => setResponseTab('body')}
            className={`py-2 px-3 border-b-2 transition ${
              responseTab === 'body'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Body
          </button>

          <button
            onClick={() => setResponseTab('headers')}
            className={`py-2 px-3 border-b-2 transition ${
              responseTab === 'headers'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Headers ({Object.keys(response.responseHeaders || {}).length})
          </button>

          <button
            onClick={() => setResponseTab('timings')}
            className={`py-2 px-3 border-b-2 transition ${
              responseTab === 'timings'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Performance & Latency
          </button>

          <button
            onClick={() => setResponseTab('tests')}
            className={`py-2 px-3 border-b-2 transition ${
              responseTab === 'tests'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Results ({response.testResults?.length || 0})
          </button>
        </div>

        {responseTab === 'body' && (
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 rounded p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setViewMode('pretty')}
                className={`px-2.5 py-0.5 rounded transition ${
                  viewMode === 'pretty' ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pretty
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-0.5 rounded transition ${
                  viewMode === 'raw' ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-0.5 rounded transition ${
                  viewMode === 'preview' ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* TAB 1: RESPONSE BODY */}
        {responseTab === 'body' && (
          <div className="h-full flex flex-col">
            {viewMode === 'preview' ? (
              <div className="flex-1 flex flex-col bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden min-h-[300px]">
                {/* HTML Preview */}
                {(response.contentType?.includes('html') || response.responseBody?.trim().startsWith('<!DOCTYPE') || response.responseBody?.trim().startsWith('<html')) ? (
                  <div className="flex-1 flex flex-col h-full">
                    <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="font-semibold text-slate-300">HTML Web Page Render</span>
                      <span className="text-[10px] text-slate-500">Sandboxed Environment</span>
                    </div>
                    <iframe
                      title="HTML Response Preview"
                      sandbox="allow-same-origin"
                      srcDoc={response.responseBody}
                      className="flex-1 w-full h-full bg-white min-h-[320px] border-0"
                    />
                  </div>
                ) : response.contentType?.startsWith('image/') ? (
                  /* Image Preview */
                  <div className="flex-1 flex items-center justify-center p-6 bg-slate-900/50">
                    <img
                      src={`data:${response.contentType};base64,${response.responseBody}`}
                      alt="Response Preview"
                      className="max-h-80 max-w-full rounded shadow-md object-contain"
                    />
                  </div>
                ) : (
                  /* Formatted JSON / Text Tree Card Preview */
                  <div className="flex-1 p-3 overflow-auto space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Structured Data Viewer</span>
                      <span className="text-[10px] text-sky-400 uppercase font-mono">{response.contentType || 'text/plain'}</span>
                    </div>
                    <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text bg-slate-900/60 p-3 rounded-md border border-slate-800/60">
                      {formattedBody}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <pre className="flex-1 p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg border border-slate-800/80 overflow-auto whitespace-pre-wrap leading-relaxed select-text">
                {viewMode === 'pretty' ? formattedBody : response.responseBody}
              </pre>
            )}
          </div>
        )}

        {/* TAB 2: RESPONSE HEADERS */}
        {responseTab === 'headers' && (
          <div className="space-y-2">
            <table className="w-full text-xs text-left border border-slate-800 rounded-md overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2 w-1/3">Header Name</th>
                  <th className="p-2">Header Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950 font-mono text-[11px]">
                {Object.entries(response.responseHeaders || {}).map(([key, val], idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2 text-sky-400 font-semibold">{key}</td>
                    <td className="p-2 text-slate-300 break-all">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PERFORMANCE & TIMINGS */}
        {responseTab === 'timings' && (
          <div className="space-y-4 max-w-xl">
            <h4 className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Latency and Network Breakdown</span>
            </h4>

            {/* Timing Breakdown Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">DNS Lookup</span>
                <span className="text-sm font-mono font-bold text-sky-400">{response.timings?.dns || 0} ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">TCP Connect</span>
                <span className="text-sm font-mono font-bold text-indigo-400">{response.timings?.tcp || 0} ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">TTFB</span>
                <span className="text-sm font-mono font-bold text-amber-400">{response.timings?.ttfb || 0} ms</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Download</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{response.timings?.download || 0} ms</span>
              </div>
            </div>

            {/* Total roundtrip gauge */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Total Round-trip Duration</span>
                <span className="text-sky-400 font-mono font-bold">{response.responseTime} ms</span>
              </div>
              {/* Colored stacked progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: '15%' }} className="bg-sky-500" title="DNS: 15%" />
                <div style={{ width: '15%' }} className="bg-indigo-500" title="TCP: 15%" />
                <div style={{ width: '50%' }} className="bg-amber-500" title="TTFB: 50%" />
                <div style={{ width: '20%' }} className="bg-emerald-500" title="Download: 20%" />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <div><strong>TTFB (Time to First Byte):</strong> Measures how long the server took to process your request and respond.</div>
              <div><strong>Total Size:</strong> {formatBytes(response.responseSize)} transfer payload.</div>
            </div>
          </div>
        )}

        {/* TAB 4: TEST RESULTS */}
        {responseTab === 'tests' && (
          <div className="space-y-3">
            {(!response.testResults || response.testResults.length === 0) ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <p>No automated test assertions were executed for this request.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Add assertions in the <strong>Tests</strong> tab above (e.g. status code == 200).
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {response.testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs ${
                      t.passed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                        : 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-100">{t.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {t.type}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          t.passed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {t.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    {!t.passed && (
                      <div className="mt-2 text-[11px] font-mono bg-slate-950/80 p-2 rounded border border-rose-900/40 text-rose-300">
                        <div>Expected: <span className="text-slate-300">{t.expected}</span></div>
                        <div>Actual: <span className="text-rose-400">{t.actual}</span></div>
                        {t.error && <div className="text-rose-500 mt-1">Error: {t.error}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

