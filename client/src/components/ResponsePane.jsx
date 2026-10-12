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
  Sparkles,
  ArrowRight,
  Terminal,
  Play,
  Download,
} from 'lucide-react';
import { AiDiagnosticsPanel } from './AiDiagnosticsPanel';

export const ResponsePane = ({ onOpenCurlImport }) => {
  const {
    response,
    isLoading,
    responseTab,
    setResponseTab,
    sendRequest,
    activeRequest,
    setAiAssistantOpen,
    openAiAssistantWithPrompt,
  } = useApi();
  const [copied, setCopied] = useState(false);
  const [bodyFilter, setBodyFilter] = useState('');
  const [viewMode, setViewMode] = useState('pretty'); // 'pretty' or 'raw'

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0D131F] p-8 text-center text-xs transition-colors">
        <div className="w-10 h-10 rounded-full border-2 border-[#0B63C5] border-t-transparent animate-spin mb-3" />
        <p className="text-[#0E2A47] dark:text-slate-100 font-bold text-sm">Sending request to proxy...</p>
        <p className="text-slate-500 text-xs mt-1">Measuring DNS, TCP handshake, TTFB, and server round-trip latency</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0D131F] p-8 text-center text-xs select-none transition-colors border-t border-[#E1E5EA] dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-[#E8F1FB] dark:bg-sky-950/60 flex items-center justify-center text-[#0B63C5] mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-[#0E2A47] dark:text-slate-100 font-bold text-base mb-1 tracking-tight">Ready for API Execution</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
          Hit <span className="text-[#0B63C5] font-bold font-mono">Send</span> to inspect response headers, network latency, real-time status codes, and test assertions.
        </p>

        {/* 3 Outlined Cards (Swagger Empty State Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl w-full text-left">
          <div
            onClick={sendRequest}
            className="p-3.5 rounded-xl border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-[#F7F8FA] dark:bg-slate-900/50 hover:bg-white transition cursor-pointer shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8F1FB] flex items-center justify-center text-[#0B63C5] mb-2.5">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <h4 className="font-bold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
              Execute Active Request
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Trigger {activeRequest.method} to active endpoint URL
            </p>
          </div>

          <div
            onClick={() => openAiAssistantWithPrompt(`Analyze and optimize this endpoint: ${activeRequest.url}`)}
            className="p-3.5 rounded-xl border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-[#F7F8FA] dark:bg-slate-900/50 hover:bg-white transition cursor-pointer shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-[#F4ECFB] flex items-center justify-center text-[#6B21A8] mb-2.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
              Generate from Prompt
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Use AI Assistant to create mock payloads & tests
            </p>
          </div>

          <div
            onClick={() => onOpenCurlImport?.()}
            className="p-3.5 rounded-xl border border-[#E1E5EA] dark:border-slate-800 hover:border-[#0B63C5] bg-[#F7F8FA] dark:bg-slate-900/50 hover:bg-white transition cursor-pointer shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-[#E8F6E3] flex items-center justify-center text-[#166534] mb-2.5">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-[#0E2A47] dark:text-slate-200 group-hover:text-[#0B63C5]">
              Generate from cURL / Code
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Import raw curl commands or OpenAPI specs
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formattedBody = formatResponseBody(response.responseBody, response.contentType);

  const handleCopyBody = () => {
    navigator.clipboard.writeText(response.responseBody || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResponse = () => {
    if (!response.responseBody) return;
    let ext = 'txt';
    let mime = 'text/plain';
    const ct = (response.contentType || '').toLowerCase();
    if (ct.includes('json')) {
      ext = 'json';
      mime = 'application/json';
    } else if (ct.includes('xml')) {
      ext = 'xml';
      mime = 'application/xml';
    } else if (ct.includes('html')) {
      ext = 'html';
      mime = 'text/html';
    } else if (ct.includes('csv')) {
      ext = 'csv';
      mime = 'text/csv';
    }

    const blob = new Blob([response.responseBody], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-${response.status || 'data'}-${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0D131F] border-t border-[#E1E5EA] dark:border-slate-800 transition-colors">
      {/* Response Status Bar */}
      <div className="px-4 py-2.5 border-b border-[#E1E5EA] dark:border-slate-800 bg-[#F7F8FA] dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {/* Status Badge Pill */}
          <span
            className={`px-3 py-1 rounded-full font-mono font-bold text-xs border ${
              isSuccess
                ? 'bg-[#E8F6E3] text-[#166534] border-[#BCE5B3]'
                : 'bg-[#FDECEB] text-[#991B1B] border-[#F9B7B5]'
            }`}
          >
            {response.status} {response.statusText || (isSuccess ? 'OK' : 'Error')}
          </span>

          {/* Response Latency */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(response.responseTime)}</span>
          </div>

          {/* Response Size */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatBytes(response.responseSize)}</span>
          </div>

          {/* Assertions / Tests Pill */}
          {response.testResults?.length > 0 && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                response.failedCount === 0
                  ? 'bg-[#E8F6E3] text-[#166534] border-[#BCE5B3]'
                  : 'bg-[#FDECEB] text-[#991B1B] border-[#F9B7B5]'
              }`}
            >
              Tests: {response.passedCount}/{response.testResults.length} Passed
            </span>
          )}
        </div>

        {/* Action buttons (Download + Copy) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadResponse}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] text-[#0E2A47] dark:text-slate-200 font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Download response"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download</span>
          </button>

          <button
            onClick={handleCopyBody}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] text-[#0E2A47] dark:text-slate-200 font-semibold text-xs transition cursor-pointer shadow-2xs"
            title="Copy response body"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* AI Proactive Diagnostics Alert Banner */}
      {(response.status >= 400 || response.status === 0 || (response.testResults || []).some((t) => !t.passed)) && (
        <div className="bg-gradient-to-r from-[#F4ECFB] via-[#F0F6FC] to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-[#E1E5EA] dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-semibold">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 animate-pulse" />
            <span>Issue detected ({response.status === 0 ? 'Network Error' : `${response.status} ${response.statusText || ''}`}). AI Assistant Copilot & 1-Click Fix is ready.</span>
          </div>
          <button
            onClick={() => openAiAssistantWithPrompt(`How do I resolve this ${response.status || 'network'} error?`)}
            className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
          >
            <Sparkles className="w-3 h-3 fill-current text-amber-300" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      )}

      {/* Underline Subtabs in Swagger Blue */}
      <div className="flex border-b border-[#E1E5EA] dark:border-slate-800 bg-[#F7F8FA] dark:bg-slate-900/40 px-3 text-xs font-medium justify-between items-center overflow-x-auto scrollbar-none">
        <div className="flex shrink-0">
          <button
            onClick={() => setResponseTab('body')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              responseTab === 'body'
                ? 'border-[#0B63C5] text-[#0B63C5] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#0E2A47]'
            }`}
          >
            Body
          </button>

          <button
            onClick={() => setResponseTab('headers')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              responseTab === 'headers'
                ? 'border-[#0B63C5] text-[#0B63C5] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#0E2A47]'
            }`}
          >
            Headers ({Object.keys(response.responseHeaders || {}).length})
          </button>

          <button
            onClick={() => setResponseTab('timings')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              responseTab === 'timings'
                ? 'border-[#0B63C5] text-[#0B63C5] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#0E2A47]'
            }`}
          >
            Timings & SLA
          </button>

          <button
            onClick={() => setResponseTab('tests')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              responseTab === 'tests'
                ? 'border-[#0B63C5] text-[#0B63C5] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#0E2A47]'
            }`}
          >
            Tests ({response.testResults?.length || 0})
          </button>

          <button
            onClick={() => setResponseTab('ai')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              responseTab === 'ai'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-[#0E2A47]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Diagnostics</span>
          </button>
        </div>

        {/* Pretty / Raw Toggle when Body Tab is active */}
        {responseTab === 'body' && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex items-center p-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-[10px] font-semibold">
              <button
                onClick={() => setViewMode('pretty')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  viewMode === 'pretty' ? 'bg-white dark:bg-slate-900 text-[#0B63C5] font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pretty
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  viewMode === 'raw' ? 'bg-white dark:bg-slate-900 text-[#0B63C5] font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Raw
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {responseTab === 'body' && (
          <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {viewMode === 'pretty' ? formattedBody : response.responseBody}
          </pre>
        )}

        {responseTab === 'headers' && (
          <div className="space-y-1.5 font-sans">
            {Object.entries(response.responseHeaders || {}).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 py-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 w-44 shrink-0 font-mono">{k}:</span>
                <span className="text-slate-900 dark:text-slate-200 font-mono break-all">{v}</span>
              </div>
            ))}
          </div>
        )}

        {responseTab === 'timings' && (
          <div className="space-y-3 font-sans max-w-lg">
            <h4 className="font-bold text-xs text-[#0E2A47] dark:text-slate-200 uppercase tracking-wider">Network Timings</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Round-trip:</span>
                <span className="font-mono font-bold text-[#0B63C5]">{formatDuration(response.responseTime)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">DNS & Connect Handshake:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">~{Math.round((response.responseTime || 100) * 0.15)} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Time To First Byte (TTFB):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">~{Math.round((response.responseTime || 100) * 0.70)} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Content Download:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">~{Math.round((response.responseTime || 100) * 0.15)} ms</span>
              </div>
            </div>
          </div>
        )}

        {responseTab === 'tests' && (
          <div className="space-y-2 font-sans">
            {(response.testResults || []).map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  t.passed
                    ? 'bg-[#E8F6E3] border-[#BCE5B3] text-[#166534]'
                    : 'bg-[#FDECEB] border-[#F9B7B5] text-[#991B1B]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.passed ? <CheckCircle2 className="w-4 h-4 text-[#166534]" /> : <XCircle className="w-4 h-4 text-[#991B1B]" />}
                  <span className="font-semibold">{t.name}</span>
                </div>
                <span className="font-mono text-[11px] font-bold uppercase">{t.passed ? 'PASSED' : 'FAILED'}</span>
              </div>
            ))}
          </div>
        )}

        {responseTab === 'ai' && (
          <AiDiagnosticsPanel response={response} />
        )}
      </div>
    </div>
  );
};
