import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Edit, Trash2, Play, Download, Upload } from 'lucide-react';
import { collectionApi, requestApi } from '../api';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await collectionApi.getAll();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await collectionApi.delete(id);
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.type === 'collection') {
        await collectionApi.importCollection({ collection: data.collection, overwrite: false });
      } else if (data.type === 'full-export' && data.collections) {
        for (const coll of data.collections) {
          await collectionApi.importCollection({ collection: coll, overwrite: false });
        }
      } else {
        alert('Invalid file format');
        return;
      }
      
      loadCollections();
      alert('Collection imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import collection');
    } finally {
      e.target.value = '';
      setImporting(false);
    }
  };

  const exportCollection = async (collection) => {
    try {
      const blob = await collectionApi.exportCollection(collection._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export collection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Collections</h1>
        <div className="flex gap-2">
          <Link
            to="/collection/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            New Collection
          </Link>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="sr-only"
              id="import-file"
              disabled={importing}
            />
            <label
              htmlFor="import-file"
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition cursor-pointer"
            >
              <Upload size={20} />
              Import
            </label>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No collections yet</p>
          <Link
            to="/collection/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Create Your First Collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection._id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Folder className="w-10 h-10 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-400">{collection.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => exportCollection(collection)}
                    className="text-gray-400 hover:text-blue-400 p-1"
                    title="Export"
                  >
                    <Download size={18} />
                  </button>
                  <Link
                    to={`/collection/${collection._id}`}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(collection._id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-700 rounded">
                    {collection.requests?.length || 0} requests
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700 rounded">
                    {collection.folders?.length || 0} folders
                  </span>
                </div>
                <div className="text-xs">
                  Updated: {new Date(collection.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/request/new', { state: { collectionId: collection._id } })}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  <Plus size={16} />
                  Add Request
                </button>
                <Link
                  to={`/collection/${collection._id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  <Play size={16} />
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}