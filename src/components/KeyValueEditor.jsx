import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function KeyValueEditor({ items, onChange, placeholder = 'Key' }) {
  const handleAdd = () => {
    onChange([...items, { key: '', value: '' }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={item.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleRemove(index)}
            className="text-red-400 hover:text-red-300 px-2"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
      >
        <Plus size={14} />
        Add
      </button>
    </div>
  );
}