import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Globe,
  Plus,
  Trash2,
  X,
  Check,
  Save,
} from 'lucide-react';

export const EnvironmentModal = ({ isOpen, onClose }) => {
  const { environments, fetchEnvironments, activeEnvironmentId, setActiveEnvironmentId } = useApi();
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const currentEnv = selectedEnv || environments[0] || null;

  const handleSelectEnv = (env) => {
    setSelectedEnv(env);
    setIsCreating(false);
  };

  const handleAddVariable = () => {
    if (!currentEnv) return;
    const updatedVars = [...(currentEnv.variables || []), { key: '', value: '', enabled: true }];
    setSelectedEnv({ ...currentEnv, variables: updatedVars });
  };

  const handleUpdateVariable = (idx, field, val) => {
    if (!currentEnv) return;
    const updatedVars = [...(currentEnv.variables || [])];
    updatedVars[idx] = { ...updatedVars[idx], [field]: val };
    setSelectedEnv({ ...currentEnv, variables: updatedVars });
  };

  const handleRemoveVariable = (idx) => {
    if (!currentEnv) return;
    const updatedVars = [...(currentEnv.variables || [])];
    updatedVars.splice(idx, 1);
    setSelectedEnv({ ...currentEnv, variables: updatedVars });
  };

  const handleSaveCurrentEnv = async () => {
    if (!currentEnv) return;
    try {
      const res = await fetch(`/api/environments/${currentEnv._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentEnv.name,
          isGlobal: currentEnv.isGlobal,
          variables: currentEnv.variables,
        }),
      });

      if (res.ok) {
        await fetchEnvironments();
        alert('Environment saved!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewEnv = async (e) => {
    e.preventDefault();
    if (!newEnvName) return;

    try {
      const res = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEnvName,
          variables: [{ key: 'baseUrl', value: 'http://localhost:5000/api/mock', enabled: true }],
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setNewEnvName('');
        setIsCreating(false);
        await fetchEnvironments();
        setSelectedEnv(created);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEnv = async (id) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;
    try {
      await fetch(`/api/environments/${id}`, { method: 'DELETE' });
      await fetchEnvironments();
      setSelectedEnv(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">Environments & Variable Management</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left sidebar with environments list, Right pane with variables editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Environments List */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Profiles</span>
              <button
                onClick={() => setIsCreating(true)}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateNewEnv} className="p-2 bg-slate-900 border border-sky-500 rounded-lg space-y-2">
                <input
                  type="text"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  placeholder="Environment name"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button type="submit" className="flex-1 py-1 bg-sky-600 rounded text-white text-[11px] font-medium">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="py-1 px-2 bg-slate-800 rounded text-slate-400 text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
              {environments.map((env) => {
                const isSelected = currentEnv?._id === env._id;
                const isActiveEnv = activeEnvironmentId === env._id;

                return (
                  <div
                    key={env._id}
                    onClick={() => handleSelectEnv(env)}
                    className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border border-sky-600 text-sky-200'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold truncate">{env.name}</div>
                      <div className="text-[10px] text-slate-500">{env.variables?.length || 0} variables</div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActiveEnv && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Currently Active" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variables Editor */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-xs bg-slate-900/50">
            {currentEnv ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{currentEnv.name}</h3>
                    <p className="text-slate-400 text-[11px]">
                      Use in URLs, headers, or body using <code className="text-sky-400">{'{{variableName}}'}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveEnvironmentId(currentEnv._id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
                    >
                      {activeEnvironmentId === currentEnv._id ? '✓ Active' : 'Set as Active'}
                    </button>
                    <button
                      onClick={handleSaveCurrentEnv}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center gap-1.5 font-semibold"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={() => handleDeleteEnv(currentEnv._id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition"
                      title="Delete environment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Variables Grid */}
                <table className="w-full text-left border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-2 w-10 text-center">Active</th>
                      <th className="p-2 w-1/3">Variable Key</th>
                      <th className="p-2">Value</th>
                      <th className="p-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950 font-mono text-[11px]">
                    {(currentEnv.variables || []).map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={v.enabled}
                            onChange={(e) => handleUpdateVariable(idx, 'enabled', e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={v.key}
                            onChange={(e) => handleUpdateVariable(idx, 'key', e.target.value)}
                            placeholder="e.g. baseUrl"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={v.value}
                            onChange={(e) => handleUpdateVariable(idx, 'value', e.target.value)}
                            placeholder="e.g. http://localhost:5000/api"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => handleRemoveVariable(idx)}
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
                  onClick={handleAddVariable}
                  className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium py-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variable Row
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Select or create an environment profile to manage variables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

