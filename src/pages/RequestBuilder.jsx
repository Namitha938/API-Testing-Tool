import KeyValueEditor from '../components/KeyValueEditor';
import AuthEditor from '../components/AuthEditor';
import ResponsePanel from '../components/ResponsePanel';
import useRequestBuilder from '../hooks/useRequestBuilder';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RequestBuilder() {
  const { req, set, response, loading, notice, send, save, isEditing } = useRequestBuilder();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('params');
  const [saving, setSaving] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const handleSave = async () => {
    setSaving(true);
    const doc = await save();
    setSaving(false);
    if (doc && !isEditing) {
      navigate(`/request/${doc._id}`, { replace: true });
    }
  };

  const tabs = [
    { id: 'params', label: 'Params' },
    { id: 'headers', label: 'Headers' },
    { id: 'auth', label: 'Auth' },
    { id: 'body', label: 'Body' },
  ];

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
          placeholder="Request name"
          value={req.name}
          onChange={(e) => set('name', e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={req.method}
          onChange={(e) => set('method', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {methods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="https://api.example.com"
          value={req.url}
          onChange={(e) => set('url', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={send}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {notice && <span className="text-sm text-gray-400 ml-2">{notice}</span>}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'params' && (
            <KeyValueEditor
              items={req.params}
              onChange={(items) => set('params', items)}
              placeholder="Param"
            />
          )}
          {activeTab === 'headers' && (
            <KeyValueEditor
              items={req.headers}
              onChange={(items) => set('headers', items)}
              placeholder="Header"
            />
          )}
          {activeTab === 'auth' && (
            <AuthEditor
              auth={req.auth}
              onChange={(auth) => set('auth', auth)}
            />
          )}
          {activeTab === 'body' && (
            <textarea
              placeholder="Request body (JSON, form data, raw text, or XML)"
              value={req.body}
              onChange={(e) => set('body', e.target.value)}
              rows={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          )}
        </div>
      </div>

      <ResponsePanel response={response} loading={loading} />
    </div>
  );
}