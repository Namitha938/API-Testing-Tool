// Code snippet generator for various programming languages

export function generateCurl(request, resolvedUrl) {
  const url = resolvedUrl || request.url || 'http://localhost:5000/api';
  const method = (request.method || 'GET').toUpperCase();
  let cmd = `curl -X ${method} "${url}"`;

  // Headers
  if (Array.isArray(request.headers)) {
    request.headers
      .filter((h) => h.enabled && h.key && h.value)
      .forEach((h) => {
        cmd += ` \\\n  -H "${h.key}: ${h.value}"`;
      });
  }

  // Auth
  if (request.auth) {
    if (request.auth.type === 'bearer' && request.auth.bearerToken) {
      cmd += ` \\\n  -H "Authorization: Bearer ${request.auth.bearerToken}"`;
    } else if (request.auth.type === 'basic' && (request.auth.username || request.auth.password)) {
      const creds = btoa(`${request.auth.username || ''}:${request.auth.password || ''}`);
      cmd += ` \\\n  -H "Authorization: Basic ${creds}"`;
    } else if (request.auth.type === 'apikey' && request.auth.apiKeyKey && request.auth.apiKeyValue) {
      if (request.auth.apiKeyAddTo === 'header') {
        cmd += ` \\\n  -H "${request.auth.apiKeyKey}: ${request.auth.apiKeyValue}"`;
      }
    }
  }

  // Body
  if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
    if (request.body.type === 'json' && request.body.rawJson) {
      cmd += ` \\\n  -H "Content-Type: application/json"`;
      cmd += ` \\\n  -d '${request.body.rawJson.replace(/'/g, "'\\''")}'`;
    } else if (request.body.type === 'text' && request.body.rawText) {
      cmd += ` \\\n  -d '${request.body.rawText.replace(/'/g, "'\\''")}'`;
    }
  }

  return cmd;
}

export function generateFetch(request, resolvedUrl) {
  const url = resolvedUrl || request.url || 'http://localhost:5000/api';
  const method = (request.method || 'GET').toUpperCase();
  const headers = {};

  if (Array.isArray(request.headers)) {
    request.headers.forEach((h) => {
      if (h.enabled && h.key && h.value) headers[h.key] = h.value;
    });
  }

  if (request.auth?.type === 'bearer' && request.auth.bearerToken) {
    headers['Authorization'] = `Bearer ${request.auth.bearerToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
    if (request.body.type === 'json' && request.body.rawJson) {
      headers['Content-Type'] = 'application/json';
      options.body = request.body.rawJson;
    }
  }

  let code = `const url = "${url}";\n`;
  code += `const options = ${JSON.stringify(options, null, 2)};\n\n`;
  code += `try {\n`;
  code += `  const response = await fetch(url, options);\n`;
  code += `  const data = await response.json();\n`;
  code += `  console.log(data);\n`;
  code += `} catch (error) {\n`;
  code += `  console.error("Error:", error);\n`;
  code += `}`;

  return code;
}

export function generateAxios(request, resolvedUrl) {
  const url = resolvedUrl || request.url || 'http://localhost:5000/api';
  const method = (request.method || 'GET').toLowerCase();
  const headers = {};

  if (Array.isArray(request.headers)) {
    request.headers.forEach((h) => {
      if (h.enabled && h.key && h.value) headers[h.key] = h.value;
    });
  }

  if (request.auth?.type === 'bearer' && request.auth.bearerToken) {
    headers['Authorization'] = `Bearer ${request.auth.bearerToken}`;
  }

  let code = `import axios from 'axios';\n\n`;
  code += `try {\n`;
  code += `  const response = await axios({\n`;
  code += `    method: '${method}',\n`;
  code += `    url: '${url}',\n`;
  if (Object.keys(headers).length > 0) {
    code += `    headers: ${JSON.stringify(headers, null, 6).trim()},\n`;
  }
  if (['post', 'put', 'patch'].includes(method) && request.body?.rawJson) {
    code += `    data: ${request.body.rawJson.trim()},\n`;
  }
  code += `  });\n`;
  code += `  console.log(response.data);\n`;
  code += `} catch (error) {\n`;
  code += `  console.error(error.response ? error.response.data : error.message);\n`;
  code += `}`;

  return code;
}

export function generatePython(request, resolvedUrl) {
  const url = resolvedUrl || request.url || 'http://localhost:5000/api';
  const method = (request.method || 'GET').toLowerCase();
  const headers = {};

  if (Array.isArray(request.headers)) {
    request.headers.forEach((h) => {
      if (h.enabled && h.key && h.value) headers[h.key] = h.value;
    });
  }

  if (request.auth?.type === 'bearer' && request.auth.bearerToken) {
    headers['Authorization'] = `Bearer ${request.auth.bearerToken}`;
  }

  let code = `import requests\n\n`;
  code += `url = "${url}"\n`;
  code += `headers = ${JSON.stringify(headers, null, 4)}\n`;

  if (['post', 'put', 'patch'].includes(method) && request.body?.rawJson) {
    code += `payload = ${request.body.rawJson.trim()}\n\n`;
    code += `response = requests.${method}(url, headers=headers, json=payload)\n`;
  } else {
    code += `\nresponse = requests.${method}(url, headers=headers)\n`;
  }

  code += `print("Status Code:", response.status_code)\n`;
  code += `print("Response:", response.json() if "application/json" in response.headers.get("Content-Type", "") else response.text)`;

  return code;
}

export function generateGo(request, resolvedUrl) {
  const url = resolvedUrl || request.url || 'http://localhost:5000/api';
  const method = (request.method || 'GET').toUpperCase();

  return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
)

func main() {
\turl := "${url}"
\treq, err := http.NewRequest("${method}", url, nil)
\tif err != nil {
\t\tpanic(err)
\t}

\tres, err := http.DefaultClient.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(string(body))
}`;
}
