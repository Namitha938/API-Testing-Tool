import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { getMethodColor, getStatusColor, formatDuration } from '../utils/formatters';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const CollectionRunnerModal = ({ isOpen, onClose, targetCollection }) => {
  const { collections, environments, activeEnvironmentId } = useApi();
  const [selectedColId, setSelectedColId] = useState(targetCollection?._id || collections[0]?._id || '');
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvironmentId || '');
  const [delayMs, setDelayMs] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [runnerResult, setRunnerResult] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  if (!isOpen) return null;

  const handleStartRunner = async () => {
    const colId = selectedColId || targetCollection?._id;
    if (!colId) return;

    setIsRunning(true);
    setRunnerResult(null);

    try {
      const res = await fetch('/api/proxy/run-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: colId,
          environmentId: selectedEnvId || null,
          delayMs: parseInt(delayMs) || 100,
        }),
      });

      const data = await res.json();
      setRunnerResult(data);
    } catch (err) {
      alert(`Runner failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const activeCol = collections.find((c) => c._id === (selectedColId || targetCollection?._id));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Automated Collection Runner</h2>
              <p className="text-xs text-slate-400">Execute multiple test cases in batch with performance metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Collection</label>
            <select
              value={selectedColId}
              onChange={(e) => setSelectedColId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.requests?.length || 0} reqs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Environment</label>
            <select
              value={selectedEnvId}
              onChange={(e) => setSelectedEnvId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="">No Environment</option>
              {environments.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Inter-request Delay (ms)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(e.target.value)}
                min="0"
                step="50"
                className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleStartRunner}
                disabled={isRunning}
                className="flex-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-semibold flex items-center justify-center gap-1.5 transition shadow"
              >
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{isRunning ? 'Running...' : 'Run Suite'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Runner Output / Live Report */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {isRunning && (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-slate-300 font-semibold">Executing collection test suite...</p>
              <p className="text-slate-500 text-[11px]">Evaluating HTTP requests and running test assertions</p>
            </div>
          )}

          {!isRunning && !runnerResult && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Layers className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-slate-300 font-medium">Ready to run</p>
              <p className="text-[11px]">Click "Run Suite" to execute all requests in {activeCol?.name || 'this collection'}.</p>
            </div>
          )}

          {runnerResult && (
            <div className="space-y-4">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Requests</span>
                  <span className="text-lg font-bold text-slate-100">{runnerResult.totalRequests}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tests Passed</span>
                  <span className="text-lg font-bold text-emerald-400">{runnerResult.totalTestsPassed}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tests Failed</span>
                  <span className={`text-lg font-bold ${runnerResult.totalTestsFailed === 0 ? 'text-slate-400' : 'text-rose-400'}`}>
                    {runnerResult.totalTestsFailed}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Duration</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">{formatDuration(runnerResult.totalRunnerDuration)}</span>
                </div>
              </div>

              {/* Execution Item Cards */}
              <div className="space-y-1.5">
                {runnerResult.results.map((item, idx) => {
                  const isExpanded = expandedItem === idx;
                  const allTestsPassed = item.failedCount === 0;

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800/80 bg-slate-950/60 overflow-hidden text-xs"
                    >
                      <div
                        onClick={() => setExpandedItem(isExpanded ? null : idx)}
                        className="p-3 flex items-center justify-between hover:bg-slate-900/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-lg">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${getMethodColor(item.method)}`}>
                            {item.method}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                          <span className="text-slate-500 font-mono text-[11px] truncate">({item.url})</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getStatusColor(item.status)}`}>
                            {item.status} {item.statusText}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {item.responseTime}ms
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              allTestsPassed
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {allTestsPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{item.passedCount}/{item.testResults?.length || 0}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detailed test results accordion */}
                      {isExpanded && item.testResults?.length > 0 && (
                        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/40 space-y-1.5">
                          {item.testResults.map((t, tIdx) => (
                            <div
                              key={tIdx}
                              className={`p-2 rounded text-[11px] flex items-center justify-between ${
                                t.passed ? 'bg-emerald-950/20 text-emerald-300' : 'bg-rose-950/20 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {t.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span className="font-medium">{t.name}</span>
                              </div>
                              <span className="font-mono text-[10px]">{t.passed ? 'PASSED' : `FAILED (Exp: ${t.expected})`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

