import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionApi } from '../api';
import { Plus, Trash2, Edit, GripVertical, FolderPlus, Save } from 'lucide-react';

export default function CollectionBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState({
    name: '',
    description: '',
    folders: [],
    requests: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderParentId, setFolderParentId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (id) {
      loadCollection();
    }
  }, [id]);

  const loadCollection = async () => {
    setLoading(true);
    try {
      const data = await collectionApi.get(id);
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!collection.name.trim()) {
      setNotice('Collection name is required');
      return;
    }
    
    setSaving(true);
    try {
      let result;
      if (id) {
        result = await collectionApi.update(id, {
          name: collection.name,
          description: collection.description
        });
      } else {
        result = await collectionApi.create({
          name: collection.name,
          description: collection.description
        });
        navigate(`/collection/${result._id}`, { replace: true });
      }
      setNotice('Collection saved');
      setTimeout(() => setNotice(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setNotice('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFolder = async () => {
    if (!folderName.trim()) return;
    
    try {
      if (editingFolderId) {
        await collectionApi.updateFolder(collection._id, editingFolderId, {
          name: folderName,
          parentId: folderParentId || null
        });
      } else {
        await collectionApi.createFolder(collection._id, {
          name: folderName,
          parentId: folderParentId || null
        });
      }
      loadCollection();
      closeFolderModal();
    } catch (error) {
      console.error('Folder error:', error);
      alert('Failed to save folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Delete this folder? Requests in this folder will be moved to root.')) return;
    try {
      await collectionApi.deleteFolder(collection._id, folderId);
      loadCollection();
    } catch (error) {
      console.error('Delete folder error:', error);
      alert('Failed to delete folder');
    }
  };

  const openFolderModal = (folder = null) => {
    if (folder) {
      setEditingFolderId(folder._id);
      setFolderName(folder.name);
      setFolderParentId(folder.parentId || '');
    } else {
      setEditingFolderId(null);
      setFolderName('');
      setFolderParentId('');
    }
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolderId(null);
    setFolderName('');
    setFolderParentId('');
  };

  const getFolderOptions = (excludeId = null) => {
    const options = [{ value: '', label: 'Root' }];
    const addChildren = (folders, prefix = '') => {
      folders.forEach(f => {
        if (f._id !== excludeId) {
          options.push({ value: f._id, label: `${prefix}${f.name}` });
          if (f.children?.length) {
            addChildren(f.children, `${prefix}  `);
          }
        }
      });
    };
    addChildren(collection.folders);
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const folderOptions = getFolderOptions(editingFolderId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          Back
        </button>
        <input
          type="text"
          placeholder="Collection name"
          value={collection.name}
          onChange={(e) => setCollection({ ...collection, name: e.target.value })}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          placeholder="Collection description"
          value={collection.description}
          onChange={(e) => setCollection({ ...collection, description: e.target.value })}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Collection'}
        </button>
        <button
          onClick={() => openFolderModal()}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <FolderPlus size={18} />
          Add Folder
        </button>
        {notice && <span className="text-sm text-gray-400 ml-2">{notice}</span>}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Folders</h3>
        </div>
        <div className="p-4">
          {collection.folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No folders yet. Click "Add Folder" to organize your requests.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {collection.folders.map((folder) => (
                <li key={folder._id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <GripVertical className="text-gray-500 cursor-grab" />
                  <Folder className="w-5 h-5 text-blue-400" />
                  <span className="flex-1 font-medium">{folder.name}</span>
                  {folder.parentId && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-600 rounded">
                      Subfolder
                    </span>
                  )}
                  <button
                    onClick={() => openFolderModal(folder)}
                    className="text-gray-400 hover:text-blue-400 p-1"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder._id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingFolderId ? 'Edit Folder' : 'New Folder'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Folder name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Parent Folder</label>
                <select
                  value={folderParentId}
                  onChange={(e) => setFolderParentId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeFolderModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
              >
                {editingFolderId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}