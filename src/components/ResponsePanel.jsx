import { useState } from 'react';

export default function ResponsePanel({ response, loading, error }) {
  const [activeTab, setActiveTab] = useState('body');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Send a request to see response</p>
      </div>
    );
  }

  const statusClass =
    response.status >= 200 && response.status < 300
      ? 'text-green-400'
      : response.status >= 400
      ? 'text-red-400'
      : 'text-yellow-400';

  const tabs = [
    { id: 'body', label: 'Body' },
    { id: 'headers', label: 'Headers' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-gray-700">
        <span className={`text-2xl font-bold ${statusClass}`}>
          {response.status}
        </span>
        <span className="text-sm text-gray-400">
          {response.statusText}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {response.time} ms
        </span>
      </div>

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

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'body' && (
          <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words font-mono">
            {typeof response.data === 'object'
              ? JSON.stringify(response.data, null, 2)
              : response.data}
          </pre>
        )}
        {activeTab === 'headers' && (
          <div className="space-y-1">
            {Object.entries(response.headers || {}).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-400">{key}:</span>
                <span className="ml-2 text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'info' && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">URL:</span>
              <span className="ml-2 text-gray-200 break-all">{response.config?.url}</span>
            </div>
            <div>
              <span className="text-gray-400">Method:</span>
              <span className="ml-2 text-gray-200">{response.config?.method?.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}