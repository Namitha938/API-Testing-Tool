import React, { useState } from 'react';
import {
  generateCurl,
  generateFetch,
  generateAxios,
  generatePython,
  generateGo,
} from '../utils/codeGenerators';
import { X, Copy, Check, Code2, Terminal } from 'lucide-react';

export const CodeSnippetModal = ({ isOpen, onClose, request, resolvedUrl }) => {
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const languages = [
    { id: 'curl', label: 'cURL', gen: generateCurl },
    { id: 'fetch', label: 'JavaScript (Fetch)', gen: generateFetch },
    { id: 'axios', label: 'JavaScript (Axios)', gen: generateAxios },
    { id: 'python', label: 'Python (Requests)', gen: generatePython },
    { id: 'go', label: 'Go (net/http)', gen: generateGo },
  ];

  const currentLang = languages.find((l) => l.id === selectedLang) || languages[0];
  const snippet = currentLang.gen(request, resolvedUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy snippet', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Generate Code Snippet</h3>
              <p className="text-[11px] text-slate-400">
                Ready-to-use client code for <span className="font-mono text-sky-300">{request.method || 'GET'} {request.name || 'Request'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Tabs Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                  selectedLang === lang.id
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition border ${
              copied
                ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Preview Area */}
        <div className="p-5 flex-1 overflow-auto bg-slate-950">
          <pre className="font-mono text-[11px] leading-relaxed text-sky-200 selection:bg-sky-500/30 selection:text-white whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Includes configured headers, authentication, and request payload</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
