import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Send, Save, Loader2, Sparkles, ChevronDown, Code2, Terminal, Folder, FolderOpen, ChevronRight, MoveRight } from 'lucide-react';
import { CodeSnippetModal } from './CodeSnippetModal';
import { CurlImportModal } from './CurlImportModal';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

// Folder Picker Menu Dropdown for Breadcrumb
function FolderPickerMenu({ collections, activeFolderId, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('#breadcrumb-folder-btn')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-lg shadow-2xl py-2 z-50 text-xs text-left"
    >
      <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span>Assign to Distinct Folder</span>
        <button type="button" onClick={onClose} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
      </div>
      <div className="max-h-56 overflow-y-auto py-1">
        {collections.map((col) => (
          <div key={col._id} className="px-1.5 py-1">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5 truncate">
              {col.name}
            </div>
            {/* Option to move to collection root without folder */}
            <button
              type="button"
              onClick={() => onSelect(col._id, null)}
              className="w-full text-left px-2.5 py-1 rounded text-[11px] text-slate-500 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center gap-1.5 italic cursor-pointer transition"
            >
              <span>(Collection Root &mdash; No Folder)</span>
            </button>
            {/* Folders */}
            {(col.folders || []).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelect(col._id, f.id)}
                className={`w-full text-left px-2.5 py-1 rounded text-[11px] flex items-center justify-between transition cursor-pointer ${
                  activeFolderId === f.id
                    ? 'bg-[#E8F1FB] dark:bg-sky-950/70 text-[#0B63C5] dark:text-sky-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#F0F6FC] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </div>
                {f.tag && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {f.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const RequestPane = ({ onOpenSaveModal, onOpenCurlImport }) => {
  const {
    activeRequest,
    setActiveRequest,
    sendRequest,
    saveRequest,
    isLoading,
    collections,
    fetchCollections,
  } = useApi();

  const [nameEditing, setNameEditing] = useState(false);
  const [urlPresetsOpen, setUrlPresetsOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [curlModalOpen, setCurlModalOpen] = useState(false);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);

  const currentCollection = collections.find((c) => c._id === activeRequest.collectionId);
  const currentFolder = currentCollection?.folders?.find((f) => f.id === activeRequest.folderId);

  const handleAssignToFolder = async (collectionId, folderId) => {
    setActiveRequest((prev) => ({
      ...prev,
      collectionId,
      folderId: folderId || null,
      isDirty: true,
    }));
    setFolderDropdownOpen(false);

    if (activeRequest._id) {
      try {
        await fetch(`/api/requests/${activeRequest._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionId,
            folderId: folderId || null,
          }),
        });
        fetchCollections?.();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMethodChange = (e) => {
    setActiveRequest((prev) => ({ ...prev, method: e.target.value }));
  };

  const handleUrlChange = (e) => {
    setActiveRequest((prev) => ({ ...prev, url: e.target.value }));
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      sendRequest();
    }
  };

  const getMethodBadgeClass = (method) => {
    const m = (method || 'GET').toUpperCase();
    if (m === 'GET') return 'badge-get';
    if (m === 'POST') return 'badge-post';
    if (m === 'PUT') return 'badge-put';
    if (m === 'DELETE') return 'badge-delete';
    if (m === 'PATCH') return 'badge-patch';
    return 'badge-get';
  };

  const mockPresets = [
    { label: 'GET Mock Users (List)', method: 'GET', url: 'http://localhost:5000/api/mock/users?page=1&limit=5' },
    { label: 'POST Create Mock User', method: 'POST', url: 'http://localhost:5000/api/mock/users' },
    { label: 'GET Mock User by ID', method: 'GET', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'PUT Update Mock User', method: 'PUT', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'DELETE Mock User', method: 'DELETE', url: 'http://localhost:5000/api/mock/users/1' },
    { label: 'GET XML Response Format', method: 'GET', url: 'http://localhost:5000/api/mock/xml' },
    { label: 'GET Delayed Latency (800ms)', method: 'GET', url: 'http://localhost:5000/api/mock/delayed?ms=800' },
    { label: 'GET Auth Protected (Bearer)', method: 'GET', url: 'http://localhost:5000/api/mock/auth-protected' },
    { label: 'GET Status Code 404', method: 'GET', url: 'http://localhost:5000/api/mock/status/404' },
    { label: 'GET Status Code 500', method: 'GET', url: 'http://localhost:5000/api/mock/status/500' },
  ];

  return (
    <div className="bg-white dark:bg-[#0D131F] border-b border-[#E1E5EA] dark:border-slate-800 p-4 shrink-0 transition-colors">
      {/* Breadcrumb Navigation above Request Title */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium select-none relative z-20">
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate max-w-[150px]">{currentCollection?.name || 'Workspace Root'}</span>
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        {/* Interactive Folder Breadcrumb with Dropdown */}
        <div className="relative inline-flex items-center">
          <button
            id="breadcrumb-folder-btn"
            type="button"
            onClick={() => setFolderDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs transition cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B63C5]"
            title="Click to assign or move request to a folder"
          >
            {currentFolder ? (
              <span className="flex items-center gap-1.5 text-[#0B63C5] dark:text-sky-400 font-semibold truncate max-w-[150px]">
                <FolderOpen className="w-3.5 h-3.5 shrink-0 text-[#0B63C5]" />
                <span className="truncate">{currentFolder.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-[#0B63C5] dark:hover:text-sky-300">
                <span className="italic">No Folder</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800/50 flex items-center gap-1 shadow-2xs">
                  Move to folder <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </span>
            )}
          </button>

          {folderDropdownOpen && (
            <FolderPickerMenu
              collections={collections}
              activeFolderId={activeRequest.folderId}
              onSelect={handleAssignToFolder}
              onClose={() => setFolderDropdownOpen(false)}
            />
          )}
        </div>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[#0E2A47] dark:text-slate-100 font-bold truncate">
          {activeRequest.name || 'Untitled Request'}
        </span>
      </div>

      {/* Request Name and Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {nameEditing ? (
            <input
              type="text"
              value={activeRequest.name}
              onChange={(e) => setActiveRequest((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={() => setNameEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setNameEditing(false)}
              autoFocus
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold px-2 py-0.5 rounded-md border border-[#0B63C5] focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setNameEditing(true)}
              className="text-sm font-bold text-[#0E2A47] dark:text-slate-100 hover:text-[#0B63C5] cursor-pointer flex items-center gap-1.5 transition"
              title="Click to rename request"
            >
              <span>{activeRequest.name || 'Untitled Request'}</span>
              <span className="text-[11px] text-slate-400 font-normal">✏️</span>
            </h2>
          )}

          {activeRequest._id ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F6E3] text-[#166534] border border-[#BCE5B3] font-bold">
              Saved
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF6E7] text-[#9A3412] border border-[#FCDCA8] font-bold">
              Unsaved
            </span>
          )}
        </div>

        {/* Quick Mock Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUrlPresetsOpen(!urlPresetsOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-[#0B63C5] px-2.5 py-1 rounded-md bg-[#F7F8FA] dark:bg-slate-800 border border-[#E1E5EA] dark:border-slate-700 transition cursor-pointer shadow-2xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0B63C5]" />
            <span>Quick Mock Endpoint</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {urlPresetsOpen && (
            <div
              className="absolute right-0 mt-1 w-72 bg-white dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs"
              onMouseLeave={() => setUrlPresetsOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Built-in Mock Endpoints
              </div>
              {mockPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveRequest((prev) => ({
                      ...prev,
                      name: preset.label,
                      method: preset.method,
                      url: preset.url,
                    }));
                    setUrlPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F0F6FC] dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  <span className="truncate">{preset.label}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${getMethodBadgeClass(preset.method)}`}>
                    {preset.method}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Method + URL Bar + Filled Blue Send Button + Outlined Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Method Selector styled as tinted pill */}
          <div className="relative shrink-0">
            <select
              value={activeRequest.method}
              onChange={handleMethodChange}
              className={`h-9 px-3 pr-7 rounded-md font-mono font-bold text-xs border appearance-none focus:outline-none cursor-pointer tracking-wider shadow-2xs transition ${getMethodBadgeClass(
                activeRequest.method
              )}`}
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-3 pointer-events-none opacity-60" />
          </div>

          {/* URL Input Bar */}
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              value={activeRequest.url}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL (e.g. {{baseUrl}}/users or https://jsonplaceholder.typicode.com/posts)"
              className="w-full h-9 bg-[#F7F8FA] dark:bg-slate-900 border border-[#E1E5EA] dark:border-slate-700 rounded-md px-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-[#0B63C5] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Action Buttons: Filled Blue Send + Outlined Secondary Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filled Blue Send Button */}
          <button
            onClick={sendRequest}
            disabled={isLoading || !activeRequest.url}
            className="h-9 px-5 rounded-md bg-[#0B63C5] hover:bg-[#0952A5] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Send Request (Ctrl + Enter)"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Send</span>
          </button>

          {/* Outlined cURL Button */}
          <button
            onClick={() => (onOpenCurlImport ? onOpenCurlImport() : setCurlModalOpen(true))}
            className="h-9 px-3 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] dark:hover:bg-slate-700 text-[#0E2A47] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Import cURL command"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>cURL</span>
          </button>

          {/* Outlined Code Snippet Button */}
          <button
            onClick={() => setCodeModalOpen(true)}
            className="h-9 px-3 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] dark:hover:bg-slate-700 text-[#0E2A47] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Generate Client Code"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Code</span>
          </button>

          {/* Outlined Save Button */}
          <button
            onClick={onOpenSaveModal}
            className="h-9 px-3 rounded-md border border-[#E1E5EA] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F0F6FC] dark:hover:bg-slate-700 text-[#0E2A47] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Save Request"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Code Snippet Modal */}
      <CodeSnippetModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        request={activeRequest}
      />

      {/* cURL Import Modal */}
      <CurlImportModal
        isOpen={curlModalOpen}
        onClose={() => setCurlModalOpen(false)}
      />
    </div>
  );
};
