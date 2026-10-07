// Format byte size to human readable string
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format milliseconds
export function formatDuration(ms) {
  if (ms === undefined || ms === null) return '0 ms';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// Attempt to pretty format JSON or XML
export function formatResponseBody(body, contentType = '') {
  if (!body) return '';
  const text = typeof body === 'string' ? body : JSON.stringify(body);

  // Check JSON
  if (contentType.includes('json') || (text.trim().startsWith('{') || text.trim().startsWith('['))) {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch (_) {
      return text;
    }
  }

  // Check XML
  if (contentType.includes('xml') || text.trim().startsWith('<')) {
    try {
      return formatXml(text);
    } catch (_) {
      return text;
    }
  }

  return text;
}

// Basic XML pretty formatter
function formatXml(xml) {
  let formatted = '';
  let indent = '';
  const tab = '  ';
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
    formatted += indent + '<' + node + '>\r\n';
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
  });
  return formatted.substring(1, formatted.length - 3);
}

// HTTP Method Color Map
export function getMethodColor(method = 'GET') {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'text-sky-400 bg-sky-950/60 border-sky-800';
    case 'POST':
      return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    case 'PUT':
      return 'text-amber-400 bg-amber-950/60 border-amber-800';
    case 'PATCH':
      return 'text-purple-400 bg-purple-950/60 border-purple-800';
    case 'DELETE':
      return 'text-rose-400 bg-rose-950/60 border-rose-800';
    default:
      return 'text-slate-400 bg-slate-800 border-slate-700';
  }
}

export function getStatusColor(code) {
  if (!code) return 'bg-gray-800 text-gray-300';
  if (code >= 200 && code < 300) return 'bg-emerald-950/80 text-emerald-400 border border-emerald-700';
  if (code >= 300 && code < 400) return 'bg-sky-950/80 text-sky-400 border border-sky-700';
  if (code >= 400 && code < 500) return 'bg-amber-950/80 text-amber-400 border border-amber-700';
  if (code >= 500) return 'bg-rose-950/80 text-rose-400 border border-rose-700';
  return 'bg-gray-800 text-gray-300';
}

