import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Wrench,
  Copy,
  Check,
  Send,
  RefreshCw,
  Zap,
  ArrowRight,
  Code2,
  FileCheck,
} from 'lucide-react';

export const AiDiagnosticsPanel = () => {
  const { response, activeRequest, setActiveRequest } = useApi();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);
  const [testGenLoading, setTestGenLoading] = useState(false);
  const [testGenSuccess, setTestGenSuccess] = useState('');

  const fetchDiagnosis = async (customPrompt = '') => {
    if (!response) return;
    setLoading(true);
    setFixApplied(false);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: activeRequest,
          response,
          userPrompt: customPrompt || userPrompt,
        }),
      });

      const data = await res.json();
      if (res.ok && data.diagnostic) {
        setDiagnostic(data.diagnostic);
      }
    } catch (err) {
      console.error('AI diagnosis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response) {
      fetchDiagnosis();
    }
  }, [response?.status, response?.responseTime]);

  const handleApplyFix = (quickFix) => {
    if (!quickFix) return;
    if (quickFix.type === 'auth') {
      setActiveRequest((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          type: quickFix.authType || 'bearer',
          token: quickFix.token || prev.auth.token,
        },
      }));
      setFixApplied(true);
    } else if (quickFix.type === 'url') {
      setActiveRequest((prev) => ({
        ...prev,
        url: quickFix.value || prev.url,
      }));
      setFixApplied(true);
    } else if (quickFix.type === 'headers') {
      setActiveRequest((prev) => ({
        ...prev,
        headers: [...(prev.headers || []), { key: quickFix.field, value: quickFix.value, enabled: true }],
      }));
      setFixApplied(true);
    }
  };

  const handleGenerateTests = async () => {
    if (!response) return;
    setTestGenLoading(true);
    setTestGenSuccess('');
    try {
      const res = await fetch('/api/ai/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: response.status,
          responseBody: response.responseBody,
          responseTime: response.responseTime,
        }),
      });
      const data = await res.json();
      if (res.ok && data.tests) {
        setActiveRequest((prev) => ({
          ...prev,
          testCases: [...(prev.testCases || []), ...data.tests],
        }));
        setTestGenSuccess(`Added ${data.tests.length} automated test assertions!`);
        setTimeout(() => setTestGenSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestGenLoading(false);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomQuestionSubmit = (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    fetchDiagnosis(userPrompt);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-slate-200 font-semibold">AI Diagnostic Engine Analyzing Request & Response...</p>
        <p className="text-slate-400 text-[11px] max-w-sm">
          Evaluating HTTP status codes, headers, response schema, network latency, and test assertion results.
        </p>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs space-y-3">
        <Sparkles className="w-8 h-8 text-purple-400 opacity-60" />
        <p className="text-slate-300 font-medium">Ready to analyze response</p>
        <button
          onClick={() => fetchDiagnosis()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run AI Diagnostic Now</span>
        </button>
      </div>
    );
  }

  const isCritical = diagnostic.severity === 'critical';
  const isWarning = diagnostic.severity === 'warning';

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto p-4 text-xs">
      {/* Top Diagnostic Summary Card */}
      <div
        className={`p-4 rounded-xl border ${
          isCritical
            ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
            : isWarning
            ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <h4 className="font-bold text-sm text-slate-100">{diagnostic.issue}</h4>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {diagnostic.severity}
          </span>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">{diagnostic.explanation}</p>
      </div>

      {/* Root Cause Analysis & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Root Cause Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Root Cause Analysis</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{diagnostic.rootCause}</p>
        </div>

        {/* Recommended Solution Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
            <Wrench className="w-4 h-4" />
            <span>Recommended Solution & Action</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{diagnostic.solution}</p>
        </div>
      </div>

      {/* Suggested Fix Snippet & 1-Click Apply */}
      {(diagnostic.codeSnippet || diagnostic.quickFix) && (
        <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Suggested Code Fix & Patch</span>
            </div>

            <div className="flex items-center gap-2">
              {diagnostic.codeSnippet && (
                <button
                  onClick={() => handleCopyCode(diagnostic.codeSnippet)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              {diagnostic.quickFix && (
                <button
                  onClick={() => handleApplyFix(diagnostic.quickFix)}
                  disabled={fixApplied}
                  className={`px-3 py-1 rounded-lg text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm transition ${
                    fixApplied ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {fixApplied ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{fixApplied ? 'Fix Applied to Request!' : '1-Click Apply Fix'}</span>
                </button>
              )}
            </div>
          </div>

          {diagnostic.codeSnippet && (
            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {diagnostic.codeSnippet}
            </pre>
          )}
        </div>
      )}

      {/* AI Automated Actions Bar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="font-semibold text-slate-200 block">AI Test Assertion Generator</span>
          <span className="text-[11px] text-slate-400">
            Automatically generate regression assertions based on this live response.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {testGenSuccess && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {testGenSuccess}
            </span>
          )}
          <button
            onClick={handleGenerateTests}
            disabled={testGenLoading}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{testGenLoading ? 'Generating...' : '+ Generate Tests with AI'}</span>
          </button>
        </div>
      </div>

      {/* Ask AI Follow-up Input */}
      <form onSubmit={handleCustomQuestionSubmit} className="pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ask AI: e.g. Why did this return 401? How do I pass authentication? Explain this payload..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder-slate-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading || !userPrompt.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </form>
    </div>
  );
};
