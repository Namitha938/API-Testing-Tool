import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Save, X, Folder, FolderPlus, Check } from 'lucide-react';

export const SaveRequestModal = ({ isOpen, onClose }) => {
  const { activeRequest, collections, saveRequest, fetchCollections } = useApi();
  const [name, setName] = useState(activeRequest.name || 'New Request');
  const [collectionId, setCollectionId] = useState(activeRequest.collectionId || collections[0]?._id || '');
  const [folderId, setFolderId] = useState(activeRequest.folderId || '');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (activeRequest) {
      setName(activeRequest.name || 'New Request');
      setCollectionId(activeRequest.collectionId || collections[0]?._id || '');
      setFolderId(activeRequest.folderId || '');
    }
  }, [activeRequest, collections, isOpen]);

  if (!isOpen) return null;

  const selectedCol = collections.find((c) => c._id === collectionId);

  const handleCreateFolderInline = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !collectionId) return;

    try {
      const res = await fetch(`/api/collections/${collectionId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (res.ok) {
        const updatedCol = await res.json();
        await fetchCollections();
        // Set newly created folder as selected
        const created = (updatedCol.folders || []).find((f) => f.name === newFolderName.trim());
        if (created) {
          setFolderId(created.id);
        }
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (err) {
      console.error('Failed to create folder inline:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !collectionId) return;

    setIsSubmitting(true);
    try {
      await saveRequest({
        name: name.trim(),
        collectionId,
        folderId: folderId || null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Save API Request</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Save into a collection or distinct API folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Request Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authenticate User, Get Products..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Target Collection <span className="text-rose-500">*</span>
            </label>
            <select
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value);
                setFolderId('');
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition"
              required
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  📁 {c.name} ({c.requests?.length || 0} APIs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">
                Distinct API Folder
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="text-sky-600 dark:text-sky-400 hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="w-3 h-3" />
                {isCreatingFolder ? 'Cancel' : '+ New Folder'}
              </button>
            </div>

            {isCreatingFolder ? (
              <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-300 dark:border-slate-700">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New API Folder Name..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleCreateFolderInline}
                  disabled={!newFolderName.trim()}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Add
                </button>
              </div>
            ) : (
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition"
              >
                <option value="">(Root Collection Level)</option>
                {selectedCol?.folders?.map((f) => (
                  <option key={f.id} value={f.id}>
                    📂 {f.name} {f.tag ? `[${f.tag}]` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              {isSubmitting ? 'Saving...' : 'Save Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
