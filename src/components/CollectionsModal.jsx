import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import {
  FolderOpen,
  Plus,
  Upload,
  Download,
  Trash2,
  X,
  FileJson,
  CheckCircle,
} from 'lucide-react';

export const CollectionsModal = ({ isOpen, onClose }) => {
  const { collections, fetchCollections } = useApi();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'import'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [importJson, setImportJson] = useState('');
  const [importMessage, setImportMessage] = useState(null);

  if (!isOpen) return null;

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        await fetchCollections();
        setActiveTab('list');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async (collectionId, format = 'postman') => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/export?format=${format}`);
      if (res.ok) {
        const data = await res.json();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collection-${collectionId}-${format}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) return;

    try {
      let parsed;
      try {
        parsed = JSON.parse(importJson);
      } catch (_) {
        setImportMessage({ success: false, text: 'Invalid JSON format.' });
        return;
      }

      const res = await fetch('/api/collections/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (res.ok) {
        setImportMessage({ success: true, text: data.message || 'Collection imported successfully!' });
        setImportJson('');
        await fetchCollections();
        setTimeout(() => {
          setActiveTab('list');
          setImportMessage(null);
        }, 1500);
      } else {
        setImportMessage({ success: false, text: data.message || 'Import failed.' });
      }
    } catch (err) {
      setImportMessage({ success: false, text: err.message });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJson(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleDelete = async (colId) => {
    if (!confirm('Are you sure you want to delete this collection and all its requests?')) return;
    try {
      await fetch(`/api/collections/${colId}`, { method: 'DELETE' });
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">API Collections Management</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Collections List ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            + Create Collection
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import Postman / JSON
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'list' && (
            <div className="space-y-3">
              {collections.map((col) => (
                <div key={col._id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-semibold text-sm text-slate-200">{col.name}</h4>
                    <p className="text-slate-400 text-[11px] truncate">{col.description || 'No description'}</p>
                    <div className="text-[10px] text-slate-500">
                      Requests: {col.requests?.length || 0} | Folders: {col.folders?.length || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport(col._id, 'postman')}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                      title="Export in Postman v2.1 collection format"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Postman</span>
                    </button>
                    <button
                      onClick={() => handleExport(col._id, 'native')}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                      title="Export native JSON"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Native JSON</span>
                    </button>
                    <button
                      onClick={() => handleDelete(col._id)}
                      className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateCollection} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Collection Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payments API v1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of this collection..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
              >
                Create Collection
              </button>
            </form>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <p className="text-slate-300 font-medium mb-1">Import Postman v2.1 or Native JSON</p>
                <p className="text-slate-400 text-[11px] mb-3">
                  Upload an exported collection JSON file or paste the JSON text directly.
                </p>

                <div className="flex items-center gap-3 mb-3">
                  <label className="cursor-pointer px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Choose JSON File</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste collection JSON content here..."
                  rows={8}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {importMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    importMessage.success
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                  }`}
                >
                  {importMessage.success && <CheckCircle className="w-4 h-4" />}
                  <span>{importMessage.text}</span>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold transition"
              >
                Import Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

