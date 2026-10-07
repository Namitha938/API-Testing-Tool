export default function AuthEditor({ auth, onChange }) {
  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'apikey', label: 'API Key' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Authentication
      </label>
      <select
        value={auth.type}
        onChange={(e) =>
          onChange({ ...auth, type: e.target.value })
        }
        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {authTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Username"
            value={auth.username || ''}
            onChange={(e) =>
              onChange({ ...auth, username: e.target.value })
            }
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={auth.password || ''}
            onChange={(e) =>
              onChange({ ...auth, password: e.target.value })
            }
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {auth.type === 'bearer' && (
        <input
          type="text"
          placeholder="Bearer Token"
          value={auth.token || ''}
          onChange={(e) => onChange({ ...auth, token: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {auth.type === 'apikey' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Key Name"
            value={auth.apiKeyName || ''}
            onChange={(e) =>
              onChange({ ...auth, apiKeyName: e.target.value })
            }
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="API Key Value"
            value={auth.apiKey || ''}
            onChange={(e) =>
              onChange({ ...auth, apiKey: e.target.value })
            }
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}