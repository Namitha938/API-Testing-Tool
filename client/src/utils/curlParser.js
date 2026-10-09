/**
 * Parses raw cURL command into an APITester request structure.
 * Supports methods (-X, --request), headers (-H, --header),
 * data/payloads (-d, --data, --data-raw, --data-binary),
 * basic auth (-u, --user), and URL with query parameters.
 */
export function parseCurlCommand(rawCurl) {
  if (!rawCurl || typeof rawCurl !== 'string') {
    throw new Error('Please paste a valid cURL command.');
  }

  // Normalize multiline cURL with escaped newlines
  let cmd = rawCurl
    .replace(/\\\r?\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();

  // Strip leading 'curl'
  if (cmd.startsWith('curl ')) {
    cmd = cmd.slice(5).trim();
  } else if (cmd.startsWith('curl')) {
    cmd = cmd.slice(4).trim();
  }

  let method = 'GET';
  let url = '';
  const headers = [];
  const params = [];
  let rawBody = '';
  let bodyType = 'none';
  const auth = {
    type: 'none',
    token: '',
    username: '',
    password: '',
    key: '',
    value: '',
    addTo: 'header',
  };

  // Helper tokenizer for flags and arguments respecting quotes
  const tokens = [];
  let currentToken = '';
  let insideSingle = false;
  let insideDouble = false;
  let escapeNext = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];

    if (escapeNext) {
      currentToken += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === "'" && !insideDouble) {
      insideSingle = !insideSingle;
      continue;
    }

    if (char === '"' && !insideSingle) {
      insideDouble = !insideDouble;
      continue;
    }

    if (/\s/.test(char) && !insideSingle && !insideDouble) {
      if (currentToken.length > 0) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken);
  }

  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];

    // Method flag
    if (t === '-X' || t === '--request') {
      if (tokens[i + 1]) {
        method = tokens[i + 1].toUpperCase();
        i += 2;
        continue;
      }
    }

    // Header flag
    if (t === '-H' || t === '--header') {
      if (tokens[i + 1]) {
        const headerStr = tokens[i + 1];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.slice(0, colonIdx).trim();
          const val = headerStr.slice(colonIdx + 1).trim();

          // Check if it's an Authorization header
          if (key.toLowerCase() === 'authorization') {
            if (val.toLowerCase().startsWith('bearer ')) {
              auth.type = 'bearer';
              auth.token = val.slice(7).trim();
            } else if (val.toLowerCase().startsWith('basic ')) {
              auth.type = 'basic';
              try {
                const decoded = atob(val.slice(6).trim());
                const [u, p] = decoded.split(':');
                auth.username = u || '';
                auth.password = p || '';
              } catch (_) {
                // Keep raw authorization header if decode fails
              }
            }
          }

          headers.push({
            key,
            value: val,
            enabled: true,
            description: '',
          });
        }
        i += 2;
        continue;
      }
    }

    // Basic Auth flag (-u, --user)
    if (t === '-u' || t === '--user') {
      if (tokens[i + 1]) {
        const userPass = tokens[i + 1];
        const [u, p] = userPass.split(':');
        auth.type = 'basic';
        auth.username = u || '';
        auth.password = p || '';
        i += 2;
        continue;
      }
    }

    // Data / Body flags
    if (
      t === '-d' ||
      t === '--data' ||
      t === '--data-raw' ||
      t === '--data-binary' ||
      t === '--data-ascii'
    ) {
      if (tokens[i + 1]) {
        rawBody = tokens[i + 1];
        if (method === 'GET') {
          method = 'POST'; // Default cURL behavior when -d is present
        }
        i += 2;
        continue;
      }
    }

    // If token looks like a URL and isn't a flag
    if (!t.startsWith('-') && (t.startsWith('http://') || t.startsWith('https://') || t.includes('.'))) {
      url = t;
      i++;
      continue;
    }

    // Unknown or other flag
    i++;
  }

  // If no explicit URL found by prefix, grab the first non-flag token that wasn't consumed
  if (!url) {
    for (const tok of tokens) {
      if (!tok.startsWith('-') && tok.length > 3) {
        url = tok;
        break;
      }
    }
  }

  if (!url) {
    throw new Error('Could not find a valid URL in the cURL command.');
  }

  // Extract query parameters from URL
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((val, key) => {
      params.push({
        key,
        value: val,
        enabled: true,
        description: '',
      });
    });
    // Remove query params from base URL for clean Workbench display
    url = `${urlObj.origin}${urlObj.pathname}`;
  } catch (_) {
    // If relative or contains template variables like {{baseUrl}}
    if (url.includes('?')) {
      const parts = url.split('?');
      url = parts[0];
      const searchStr = parts[1];
      const searchPairs = searchStr.split('&');
      for (const pair of searchPairs) {
        const [k, v] = pair.split('=');
        if (k) {
          params.push({
            key: decodeURIComponent(k),
            value: v ? decodeURIComponent(v) : '',
            enabled: true,
            description: '',
          });
        }
      }
    }
  }

  // Determine bodyType if body exists
  if (rawBody) {
    const trimmedBody = rawBody.trim();
    if (
      (trimmedBody.startsWith('{') && trimmedBody.endsWith('}')) ||
      (trimmedBody.startsWith('[') && trimmedBody.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmedBody);
        rawBody = JSON.stringify(parsed, null, 2);
        bodyType = 'json';
      } catch (_) {
        bodyType = 'raw';
      }
    } else if (trimmedBody.startsWith('<?xml') || trimmedBody.startsWith('<')) {
      bodyType = 'xml';
    } else if (trimmedBody.includes('=') && !trimmedBody.includes('\n')) {
      bodyType = 'x-www-form-urlencoded';
    } else {
      bodyType = 'raw';
    }
  }

  return {
    method,
    url,
    headers,
    params,
    auth,
    bodyType,
    rawBody,
  };
}
