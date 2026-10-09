import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Sparkles,
  X,
  Send,
  Zap,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Terminal,
  FileCheck,
  Globe,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const AiAssistantDrawer = ({ isOpen, onClose }) => {
  const {
    activeRequest,
    setActiveRequest,
    response,
    sendRequest,
    isLoading,
    initialAiPrompt,
    setInitialAiPrompt,
  } = useApi();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hello! I am your **AI Assistant**. I continuously inspect your real API requests, diagnose error status codes, solve CORS/Authentication issues, and offer 1-click fixes.\n\nHow can I help you test your API today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [appliedFixMsg, setAppliedFixMsg] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [diagnostic, setDiagnostic] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, diagnostic]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle incoming initial prompt from other parts of UI
  useEffect(() => {
    if (isOpen && initialAiPrompt) {
      handleSendMessage(initialAiPrompt);
      setInitialAiPrompt('');
    }
  }, [isOpen, initialAiPrompt]);

  // Fetch proactive diagnosis whenever response changes
  useEffect(() => {
    if (response) {
      loadDiagnostic();
    } else {
      setDiagnostic(null);
    }
  }, [response?.status, response?.responseTime, activeRequest.url, activeRequest.method]);

  const loadDiagnostic = async () => {
    if (!response) return;
    setDiagLoading(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: activeRequest,
          response,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.diagnostic) {
          setDiagnostic(data.diagnostic);
        }
      }
    } catch (err) {
      console.warn('AI Diagnostic error:', err);
    } finally {
      setDiagLoading(false);
    }
  };

  // Apply Quick Fix to the workbench activeRequest
  const applyFix = (fix) => {
    if (!fix) return;

    if (fix.type === 'auth') {
      setActiveRequest((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          type: fix.authType || 'bearer',
          token: fix.token || prev.auth?.token || '',
          key: fix.key || prev.auth?.key || '',
          value: fix.value || prev.auth?.value || '',
          addTo: fix.addTo || 'header',
        },
      }));
      setAppliedFixMsg('Authentication configured in Request Builder!');
    } else if (fix.type === 'header') {
      setActiveRequest((prev) => {
        const existing = prev.headers || [];
        const index = existing.findIndex((h) => (h.key || '').toLowerCase() === (fix.key || '').toLowerCase());
        if (index >= 0) {
          const updated = [...existing];
          updated[index] = { ...updated[index], value: fix.value, enabled: true };
          return { ...prev, headers: updated };
        }
        return {
          ...prev,
          headers: [...existing, { key: fix.key, value: fix.value, enabled: true }],
        };
      });
      setAppliedFixMsg(`Header "${fix.key}" added to request!`);
    } else if (fix.type === 'url') {
      setActiveRequest((prev) => ({
        ...prev,
        url: fix.value || prev.url,
      }));
      setAppliedFixMsg('URL updated successfully!');
    } else if (fix.type === 'method') {
      setActiveRequest((prev) => ({
        ...prev,
        method: fix.value || prev.method,
      }));
      setAppliedFixMsg(`HTTP Method switched to ${fix.value}!`);
    } else if (fix.type === 'body') {
      setActiveRequest((prev) => ({
        ...prev,
        bodyType: fix.bodyType || 'json',
        rawBody: fix.rawBody !== undefined ? fix.rawBody : prev.rawBody,
      }));
      setAppliedFixMsg('Request payload updated!');
    }

    setTimeout(() => setAppliedFixMsg(''), 4000);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyContext,
          request: activeRequest,
          response,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: 'msg-' + (Date.now() + 1),
          role: 'assistant',
          content: data.reply || 'Analysis complete.',
          quickFix: data.quickFix || null,
          source: data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errData = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg-err-' + Date.now(),
            role: 'assistant',
            content: `⚠️ Could not reach AI service: ${errData.message || 'Server error'}. Falling back to default diagnostics.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Connection error: ${err.message}. Please check your network or server status.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Chat cleared. Ask me any question or tap a suggestion chip below to troubleshoot your real API!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    { label: '🔍 Diagnose current error', prompt: 'Why did this API request fail? Provide root cause and solution.' },
    { label: '🛠️ How do I fix status code?', prompt: `How do I fix HTTP status ${response?.status || 'code'} for this endpoint?` },
    { label: '🔑 Fix Bearer / Auth', prompt: 'How do I authenticate with this endpoint using Bearer Token or API Key?' },
    { label: '📜 Generate cURL command', prompt: 'Generate a cURL command for this request so I can run it in bash terminal.' },
    { label: '🌐 Check CORS / Network', prompt: 'Is this issue caused by CORS, SSL certificate, or target server down?' },
    { label: '🧪 Suggest test cases', prompt: 'Generate automated test assertions to validate this response.' },
  ];

  if (!isOpen) return null;

  const hasError = response && (response.status >= 400 || response.status === 0);

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out ${
        isMaximized ? 'w-full sm:w-[85vw] lg:w-[65vw]' : 'w-full sm:w-[480px] lg:w-[520px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/25 ring-1 ring-purple-500/20">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                AI Assistant Copilot
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300/60 dark:border-purple-700/50 font-mono font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Real-time API debugging & 1-click troubleshooting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isMaximized ? 'Restore standard width' : 'Maximize Assistant width'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target API Context Bar */}
      <div className="px-4 py-2 border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/40 flex items-center justify-between text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 shrink-0">
            {activeRequest.method || 'GET'}
          </span>
          <span className="truncate text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {activeRequest.url || 'No URL specified'}
          </span>
        </div>

        {response ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                response.status >= 400 || response.status === 0
                  ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {response.status === 0 ? 'Network Error' : `${response.status} ${response.statusText || ''}`}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{response.responseTime || 0}ms</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic shrink-0">Not executed yet</span>
        )}
      </div>

      {/* Applied Fix Toast Alert */}
      {appliedFixMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{appliedFixMsg}</span>
          </div>
          <button
            onClick={() => sendRequest()}
            disabled={isLoading}
            className="px-2.5 py-0.5 rounded bg-white text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{isLoading ? 'Sending...' : 'Test Again Now'}</span>
          </button>
        </div>
      )}

      {/* Proactive Issue Alert Banner (when error status is active) */}
      {hasError && diagnostic && (
        <div className="px-4 py-3 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-900 dark:text-rose-200">
                  {diagnostic.issue || 'API Issue Detected'}
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed line-clamp-2">
                  {diagnostic.rootCause}
                </p>
              </div>
            </div>

            {diagnostic.quickFix && (
              <button
                onClick={() => applyFix(diagnostic.quickFix)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer active:scale-95"
              >
                <Wrench className="w-3 h-3" />
                <span>1-Click Fix</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conversation Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
              }`}
            >
              {/* Message Header / Timestamp */}
              <div className="flex items-center justify-between text-[10px] opacity-70 mb-1.5">
                <span className="font-semibold">{msg.role === 'user' ? 'You' : 'AI Copilot'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content (Markdown Rendered style) */}
              <div className="whitespace-pre-line text-xs space-y-1.5 font-sans leading-relaxed">
                {msg.content}
              </div>

              {/* Action Fix Button inside Assistant Bubble */}
              {msg.quickFix && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Recommended 1-Click Fix:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => applyFix(msg.quickFix)}
                      className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{msg.quickFix.label || 'Apply Fix to Request'}</span>
                    </button>
                    {hasError && (
                      <button
                        onClick={() => {
                          applyFix(msg.quickFix);
                          setTimeout(() => sendRequest(), 100);
                        }}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply & Retest</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Copy message button */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium ml-1">Analyzing API telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isSending}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-[11px] font-medium whitespace-nowrap transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Assistant about this API request or issue..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-slate-400 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
          <span>Context: Request URL, headers, payload, & live response status</span>
          <span className="font-mono">APITester AI v2.0</span>
        </div>
      </div>
    </div>
  );
};
