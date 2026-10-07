import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { getMethodColor, getStatusColor } from '../utils/formatters';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Clock,
  Layers,
  Search,
  MoreVertical,
  Play,
  Upload,
  Globe,
  FileCode,
} from 'lucide-react';

export const Sidebar = ({ onOpenCollections, onOpenEnvironments, onRunCollection }) => {
  const {
    collections,
    loadSavedRequest,
    activeRequest,
    history,
    loadHistoryItem,
    clearHistory,
    fetchCollections,
    newRequestTemplate,
    environments,
  } = useApi();

  const [activeTab, setActiveTab] = useState('collections'); // 'collections', 'history', 'environments'
  const [searchTerm, setSearchTerm] = useState('');
  const [openCollections, setOpenCollections] = useState({});
  const [openFolders, setOpenFolders] = useState({});

  // Toggle collection accordion
  const toggleCollection = (id) => {
    setOpenCollections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle folder accordion
  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add a new empty request into collection
  const handleAddRequestToCollection = async (e, collectionId, folderId = null) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Request',
          collectionId,
          folderId,
          method: 'GET',
          url: 'http://localhost:5000/api/mock/users',
        }),
      });
      if (res.ok) {
        const reqDoc = await res.json();
        await fetchCollections();
        loadSavedRequest(reqDoc);
        setOpenCollections((prev) => ({ ...prev, [collectionId]: true }));
        if (folderId) {
          setOpenFolders((prev) => ({ ...prev, [folderId]: true }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add folder to collection
  const handleAddFolder = async (e, collectionId) => {
    e.stopPropagation();
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      await fetch(`/api/collections/${collectionId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName }),
      });
      fetchCollections();
      setOpenCollections((prev) => ({ ...prev, [collectionId]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete saved request
  const handleDeleteRequest = async (e, reqId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await fetch(`/api/requests/${reqId}`, { method: 'DELETE' });
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate saved request
  const handleDuplicateRequest = async (e, reqId) => {
    e.stopPropagation();
    try {
      await fetch(`/api/requests/${reqId}/duplicate`, { method: 'POST' });
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold bg-slate-900/60">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'collections'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Collections</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {collections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'history'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('environments')}
          className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'environments'
              ? 'border-sky-500 text-sky-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Envs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {environments.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* TAB 1: COLLECTIONS */}
      {activeTab === 'collections' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-900/40 text-xs">
            <span className="text-slate-400 font-medium">Collections List</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenCollections}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                title="Create or Import Collection"
              >
                <Plus className="w-3 h-3 text-sky-400" />
                <span>New / Import</span>
              </button>
            </div>
          </div>

          {/* Collection Tree View */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {collections.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No collections yet</p>
                <button
                  onClick={onOpenCollections}
                  className="mt-3 text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Create or import one
                </button>
              </div>
            ) : (
              collections.map((col) => {
                const isOpen = openCollections[col._id] ?? true;
                const filteredRequests = (col.requests || []).filter(
                  (r) =>
                    !searchTerm ||
                    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.url.toLowerCase().includes(searchTerm.toLowerCase())
                );

                // Group requests by root vs folder
                const rootRequests = filteredRequests.filter((r) => !r.folderId);

                return (
                  <div key={col._id} className="rounded-md border border-slate-800/70 bg-slate-900/30 overflow-hidden text-xs">
                    {/* Collection Header */}
                    <div
                      onClick={() => toggleCollection(col._id)}
                      className="flex items-center justify-between px-2.5 py-2 hover:bg-slate-800/50 cursor-pointer transition text-slate-300 font-medium group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{col.name}</span>
                        <span className="text-[10px] text-slate-500">({col.requests?.length || 0})</span>
                      </div>

                      {/* Collection Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleAddRequestToCollection(e, col._id)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-300"
                          title="Add Request"
                        >
                          <Plus className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={(e) => handleAddFolder(e, col._id)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-300"
                          title="Add Folder"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => onRunCollection(col)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-300"
                          title="Run Collection"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    </div>

                    {/* Collection Content */}
                    {isOpen && (
                      <div className="pl-4 pr-1 py-1 space-y-0.5 border-t border-slate-800/40">
                        {/* Folders */}
                        {(col.folders || []).map((folder) => {
                          const folderRequests = filteredRequests.filter((r) => r.folderId === folder.id);
                          const isFolderOpen = openFolders[folder.id] ?? true;

                          return (
                            <div key={folder.id} className="my-0.5">
                              <div
                                onClick={() => toggleFolder(folder.id)}
                                className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-800/40 rounded cursor-pointer text-slate-300 group"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  {isFolderOpen ? (
                                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                                  )}
                                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  <span className="truncate">{folder.name}</span>
                                  <span className="text-[10px] text-slate-500">({folderRequests.length})</span>
                                </div>
                                <button
                                  onClick={(e) => handleAddRequestToCollection(e, col._id, folder.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-300 transition"
                                  title="Add Request into Folder"
                                >
                                  <Plus className="w-3 h-3 text-sky-400" />
                                </button>
                              </div>

                              {isFolderOpen && (
                                <div className="pl-4 space-y-0.5">
                                  {folderRequests.map((req) => (
                                    <RequestItem
                                      key={req._id}
                                      req={req}
                                      isActive={activeRequest._id === req._id}
                                      onSelect={() => loadSavedRequest(req)}
                                      onDelete={(e) => handleDeleteRequest(e, req._id)}
                                      onDuplicate={(e) => handleDuplicateRequest(e, req._id)}
                                    />
                                  ))}
                                  {folderRequests.length === 0 && (
                                    <div className="text-[11px] text-slate-600 pl-4 py-1 italic">Empty folder</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Root Requests */}
                        {rootRequests.map((req) => (
                          <RequestItem
                            key={req._id}
                            req={req}
                            isActive={activeRequest._id === req._id}
                            onSelect={() => loadSavedRequest(req)}
                            onDelete={(e) => handleDeleteRequest(e, req._id)}
                            onDuplicate={(e) => handleDuplicateRequest(e, req._id)}
                          />
                        ))}

                        {filteredRequests.length === 0 && (col.folders || []).length === 0 && (
                          <div className="text-[11px] text-slate-500 pl-4 py-2 italic">
                            No requests here yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-900/40 text-xs">
            <span className="text-slate-400 font-medium">Recent Runs ({history.length})</span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No request history recorded</p>
                <p className="text-[11px] text-slate-600 mt-1">Send requests to view history logs</p>
              </div>
            ) : (
              history
                .filter(
                  (h) =>
                    !searchTerm ||
                    h.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    h.method.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((hist) => (
                  <div
                    key={hist._id}
                    onClick={() => loadHistoryItem(hist)}
                    className="p-2 rounded-md border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer transition text-xs group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(hist.method)} font-mono`}>
                          {hist.method}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getStatusColor(hist.status)} font-mono`}>
                          {hist.status || 'ERR'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {hist.responseTime}ms
                      </span>
                    </div>

                    <div className="text-slate-300 font-mono text-[11px] truncate" title={hist.url}>
                      {hist.url}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{new Date(hist.createdAt).toLocaleTimeString()}</span>
                      {hist.testResults?.length > 0 && (
                        <span className={`font-mono ${hist.failedCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Tests: {hist.passedCount}/{hist.testResults.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ENVIRONMENTS */}
      {activeTab === 'environments' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-900/40 text-xs">
            <span className="text-slate-400 font-medium">Environment Profiles</span>
            <button
              onClick={onOpenEnvironments}
              className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition"
            >
              <Plus className="w-3 h-3" /> Manage
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {environments.map((env) => (
              <div
                key={env._id}
                onClick={onOpenEnvironments}
                className="p-2.5 rounded-md border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200">{env.name}</span>
                  {env.isGlobal && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Global
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Variables configured: <span className="text-slate-300 font-mono">{env.variables?.length || 0}</span></div>
                  <div className="truncate font-mono text-[10px] text-slate-400">
                    {env.variables?.map(v => v.key).slice(0, 3).join(', ')}
                    {env.variables?.length > 3 ? '...' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

// Sub-component for individual request items in tree
const RequestItem = ({ req, isActive, onSelect, onDelete, onDuplicate }) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition text-xs ${
        isActive
          ? 'bg-sky-950/60 text-sky-200 border-l-2 border-sky-400'
          : 'hover:bg-slate-800/40 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getMethodColor(req.method)} font-mono shrink-0`}>
          {req.method}
        </span>
        <span className="truncate">{req.name}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onDuplicate}
          className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

