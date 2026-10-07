import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Save, X, Folder } from 'lucide-react';

export const SaveRequestModal = ({ isOpen, onClose }) => {
  const { activeRequest, collections, saveRequest } = useApi();
  const [name, setName] = useState(activeRequest.name || 'New Request');
  const [collectionId, setCollectionId] = useState(activeRequest.collectionId || collections[0]?._id || '');
  const [folderId, setFolderId] = useState(activeRequest.folderId || '');

  if (!isOpen) return null;

  const selectedCol = collections.find((c) => c._id === collectionId);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !collectionId) return;

    await saveRequest({
      name,
      collectionId,
      folderId: folderId || null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Save Request</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Request Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Collection</label>
            <select
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value);
                setFolderId('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              required
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCol && selectedCol.folders?.length > 0 && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Folder (Optional)</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="">Root of collection</option>
                {selectedCol.folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold"
            >
              Save to Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

