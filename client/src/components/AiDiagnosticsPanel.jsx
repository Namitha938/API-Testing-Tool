import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Copy,
  Check,
  Send,
  Zap,
  Code2,
  FileCheck,
  Shield,
  Sliders,
  Filter,
  Lightbulb,
  ArrowRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const AiDiagnosticsPanel = () => {
  const { response, activeRequest, setActiveRequest, openAiAssistantWithPrompt } = useApi();
  const [diagnostic, setDiagnostic] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState(new Set());
  const [testGenLoading, setTestGenLoading] = useState(false);
  const [testGenSuccess, setTestGenSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
        setSuggestions(data.diagnostic.suggestions || data.suggestions || []);
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

  // Apply Quick Fix from diagnosis
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

  // Apply individual smart suggestion
  const handleApplySuggestion = (sug) => {
    if (!sug.action) return;
    const { action } = sug;

    if (action.type === 'url') {
      setActiveRequest((prev) => ({
        ...prev,
        url: action.value || prev.url,
      }));
    } else if (action.type === 'header') {
      setActiveRequest((prev) => {
        const existing = prev.headers || [];
        const index = existing.findIndex((h) => (h.key || '').toLowerCase() === action.key.toLowerCase());
        if (index >= 0) {
          const updated = [...existing];
          updated[index] = { ...updated[index], value: action.value, enabled: true };
          return { ...prev, headers: updated };
        }
        return {
          ...prev,
          headers: [...existing, { key: action.key, value: action.value, enabled: true }],
        };
      });
    } else if (action.type === 'auth') {
      setActiveRequest((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          type: action.authType || 'bearer',
          token: action.token || prev.auth?.token,
        },
      }));
    } else if (action.type === 'test') {
      setActiveRequest((prev) => ({
        ...prev,
        testCases: [...(prev.testCases || []), action.test],
      }));
    }

    setAppliedSuggestionIds((prev) => new Set([...prev, sug.id]));
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
        <p className="text-slate-200 font-semibold">AI Diagnostic & Suggestions Engine Analyzing...</p>
        <p className="text-slate-400 text-[11px] max-w-sm">
          Evaluating HTTP status codes, security headers, SLA latency, response schemas, and best practice suggestions.
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
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run AI Diagnostic & Suggestions</span>
        </button>
      </div>
    );
  }

  const isCritical = diagnostic.severity === 'critical';
  const isWarning = diagnostic.severity === 'warning';

  const categories = ['All', ...Array.from(new Set(suggestions.map((s) => s.category)))];
  const filteredSuggestions =
    selectedCategory === 'All' ? suggestions : suggestions.filter((s) => s.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'Performance':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Testing':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Headers':
        return <Sliders className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'high') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          HIGH PRIORITY
        </span>
      );
    }
    if (sev === 'medium') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          RECOMMENDED
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
        OPTIONAL
      </span>
    );
  };

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
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => openAiAssistantWithPrompt(diagnostic?.issue ? `How do I resolve ${diagnostic.issue}?` : '')}
              className="px-2.5 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">{diagnostic.explanation}</p>
      </div>

      {/* Root Cause & Solution Grid */}
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
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              {diagnostic.quickFix && (
                <button
                  onClick={() => handleApplyFix(diagnostic.quickFix)}
                  disabled={fixApplied}
                  className={`px-3 py-1 rounded-lg text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm transition cursor-pointer ${
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

      {/* ======================================================== */}
      {/* SMART AI SUGGESTIONS SECTION (NEW)                      */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>AI Suggestions & Optimizations</span>
                <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                  {suggestions.length} available
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Proactive recommendations to enhance security, latency SLAs, headers, and test coverage.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        {filteredSuggestions.length === 0 ? (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center text-slate-500 text-xs">
            No suggestions found for this category.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSuggestions.map((sug) => {
              const isApplied = appliedSuggestionIds.has(sug.id);
              return (
                <div
                  key={sug.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isApplied
                      ? 'bg-emerald-950/15 border-emerald-800/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300">
                          {getCategoryIcon(sug.category)}
                          <span>{sug.category}</span>
                        </span>
                        {getSeverityBadge(sug.severity)}
                        <h4 className="font-semibold text-xs text-slate-100">{sug.title}</h4>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                        {sug.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    {sug.action && (
                      <button
                        onClick={() => handleApplySuggestion(sug)}
                        disabled={isApplied}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isApplied
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{sug.action.label || 'Apply'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Automated Test Generator Bar */}
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
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
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
            placeholder="Ask AI: e.g. How can I optimize response time? Suggest caching headers? Explain this error..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder-slate-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading || !userPrompt.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </form>
    </div>
  );
};
