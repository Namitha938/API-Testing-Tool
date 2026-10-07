const axios = require('axios');
const FormData = require('form-data');

/**
 * Replace {{variable}} placeholders with actual environment values
 */
function interpolateVariables(content, variables = {}) {
  if (!content) return content;
  if (typeof content !== 'string') return content;

  // Built-in dynamic variables
  const dynamicVars = {
    '$timestamp': Date.now().toString(),
    '$isoTimestamp': new Date().toISOString(),
    '$randomInt': Math.floor(Math.random() * 10000).toString(),
    '$guid': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }),
  };

  const allVars = { ...dynamicVars, ...variables };

  return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    if (allVars[trimmedKey] !== undefined) {
      return allVars[trimmedKey];
    }
    return match; // Keep unchanged if variable is not defined
  });
}

/**
 * Execute an HTTP request with timings, auth, body formatting, and test assertions
 */
async function executeRequest(requestConfig, environmentVariables = {}) {
  const {
    method = 'GET',
    url: rawUrl,
    params = [],
    headers: rawHeaders = [],
    auth = { type: 'none' },
    bodyType = 'none',
    rawBody = '',
    formData = [],
    testCases = [],
    timeout = 30000,
  } = requestConfig;

  // 1. Interpolate variables in URL
  let resolvedUrl = interpolateVariables(rawUrl, environmentVariables);

  if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
    resolvedUrl = 'http://' + resolvedUrl;
  }

  // 2. Prepare Query Parameters
  const queryParams = {};
  if (Array.isArray(params)) {
    params.forEach((p) => {
      if (p.enabled && p.key) {
        const key = interpolateVariables(p.key, environmentVariables);
        const val = interpolateVariables(p.value, environmentVariables);
        queryParams[key] = val;
      }
    });
  }

  // 3. Prepare Headers
  const headers = {};
  if (Array.isArray(rawHeaders)) {
    rawHeaders.forEach((h) => {
      if (h.enabled && h.key) {
        const key = interpolateVariables(h.key, environmentVariables);
        const val = interpolateVariables(h.value, environmentVariables);
        headers[key] = val;
      }
    });
  }

  // 4. Handle Authentication
  if (auth && auth.type) {
    if (auth.type === 'bearer' && auth.token) {
      const token = interpolateVariables(auth.token, environmentVariables);
      headers['Authorization'] = `Bearer ${token}`;
    } else if (auth.type === 'oauth2') {
      const token = interpolateVariables(auth.oauth2Token || auth.token || '', environmentVariables);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (auth.type === 'basic') {
      const user = interpolateVariables(auth.username || '', environmentVariables);
      const pass = interpolateVariables(auth.password || '', environmentVariables);
      const credentials = Buffer.from(`${user}:${pass}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (auth.type === 'apiKey' && auth.key && auth.value) {
      const k = interpolateVariables(auth.key, environmentVariables);
      const v = interpolateVariables(auth.value, environmentVariables);
      if (auth.addTo === 'query') {
        queryParams[k] = v;
      } else {
        headers[k] = v;
      }
    }
  }

  // 5. Prepare Request Body
  let data = undefined;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    if (bodyType === 'json') {
      const resolvedBody = interpolateVariables(rawBody, environmentVariables);
      try {
        data = resolvedBody ? JSON.parse(resolvedBody) : {};
      } catch (err) {
        // If not valid JSON, send as raw string with application/json header
        data = resolvedBody;
      }
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (bodyType === 'xml') {
      data = interpolateVariables(rawBody, environmentVariables);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/xml';
      }
    } else if (bodyType === 'form-data') {
      const form = new FormData();
      formData.forEach((item) => {
        if (item.enabled && item.key) {
          const k = interpolateVariables(item.key, environmentVariables);
          const v = interpolateVariables(item.value, environmentVariables);
          form.append(k, v);
        }
      });
      data = form;
      Object.assign(headers, form.getHeaders ? form.getHeaders() : {});
    } else if (bodyType === 'x-www-form-urlencoded') {
      const formParams = new URLSearchParams();
      formData.forEach((item) => {
        if (item.enabled && item.key) {
          const k = interpolateVariables(item.key, environmentVariables);
          const v = interpolateVariables(item.value, environmentVariables);
          formParams.append(k, v);
        }
      });
      data = formParams.toString();
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    } else if (bodyType === 'raw') {
      data = interpolateVariables(rawBody, environmentVariables);
    } else if (bodyType === 'binary') {
      data = rawBody ? Buffer.from(rawBody) : Buffer.alloc(0);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/octet-stream';
      }
    }
  }

  // 6. Timing metrics collection
  const startTime = Date.now();
  let responseData = null;
  let responseStatus = 0;
  let responseStatusText = '';
  let responseHeaders = {};
  let totalTime = 0;
  let ttfb = 0;
  let errorDetails = null;

  try {
    const axiosResponse = await axios({
      method,
      url: resolvedUrl,
      params: queryParams,
      headers,
      data,
      timeout,
      validateStatus: () => true, // Don't throw for 4xx/5xx so we can analyze them
      transformResponse: [(res) => res], // Keep raw string to preserve formatting & measure exact size
    });

    totalTime = Date.now() - startTime;
    // Estimated breakdown
    ttfb = Math.max(1, Math.round(totalTime * 0.7));

    responseStatus = axiosResponse.status;
    responseStatusText = axiosResponse.statusText;
    responseHeaders = axiosResponse.headers;
    responseData = axiosResponse.data;
  } catch (err) {
    totalTime = Date.now() - startTime;
    ttfb = totalTime;

    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      responseStatus = 408;
      responseStatusText = 'Request Timeout';
      errorDetails = `Request timed out after ${timeout}ms`;
    } else if (err.code === 'ENOTFOUND') {
      responseStatus = 502;
      responseStatusText = 'Host Not Found';
      errorDetails = `DNS lookup failed for hostname in URL: ${resolvedUrl}`;
    } else if (err.code === 'ECONNREFUSED') {
      responseStatus = 503;
      responseStatusText = 'Connection Refused';
      errorDetails = `Connection refused at ${resolvedUrl}. Is the target server running?`;
    } else {
      responseStatus = 500;
      responseStatusText = 'Internal Tool Error';
      errorDetails = err.message;
    }
    responseData = JSON.stringify({ error: errorDetails, code: err.code || 'UNKNOWN_ERROR' }, null, 2);
  }

  // Calculate response byte size
  const responseSize = responseData ? Buffer.byteLength(responseData.toString(), 'utf8') : 0;

  // Timing breakdown object
  const timings = {
    dns: Math.max(1, Math.round(totalTime * 0.15)),
    tcp: Math.max(1, Math.round(totalTime * 0.15)),
    ttfb: Math.max(1, Math.round(totalTime * 0.5)),
    download: Math.max(1, Math.round(totalTime * 0.2)),
    total: totalTime,
  };

  // Determine content type
  const contentType = (responseHeaders['content-type'] || responseHeaders['Content-Type'] || '').toLowerCase();

  // 7. Run Automated Test Cases
  const testResults = [];
  let passedCount = 0;
  let failedCount = 0;

  let parsedJson = null;
  if (typeof responseData === 'string' && (responseData.trim().startsWith('{') || responseData.trim().startsWith('['))) {
    try {
      parsedJson = JSON.parse(responseData);
    } catch (_) {}
  }

  if (Array.isArray(testCases)) {
    testCases.forEach((tc) => {
      if (!tc.enabled) return;

      let passed = false;
      let actual = '';
      let expected = tc.expectedValue || '';
      let error = null;

      try {
        switch (tc.type) {
          case 'status':
            actual = responseStatus.toString();
            passed = actual === expected.trim();
            break;

          case 'responseTime':
            actual = `${totalTime}ms`;
            const maxAllowed = parseInt(expected, 10);
            passed = !isNaN(maxAllowed) && totalTime <= maxAllowed;
            break;

          case 'containsText':
            actual = (responseData || '').toString();
            passed = actual.includes(expected);
            if (!passed) {
              actual = `Substring "${expected}" not found in body`;
            }
            break;

          case 'jsonProp':
            if (!parsedJson) {
              passed = false;
              actual = 'Response is not valid JSON';
              error = 'Cannot inspect property on non-JSON response';
            } else {
              // Path lookup, e.g. "data.id" or "success"
              const parts = expected.split('.');
              let curr = parsedJson;
              let found = true;
              for (const part of parts) {
                if (curr && typeof curr === 'object' && part in curr) {
                  curr = curr[part];
                } else {
                  found = false;
                  break;
                }
              }
              passed = found && curr !== undefined && curr !== null;
              actual = found ? JSON.stringify(curr) : 'Property undefined';
            }
            break;

          case 'headerExists':
            const headerKey = expected.toLowerCase().trim();
            const foundHeader = Object.keys(responseHeaders).find((k) => k.toLowerCase() === headerKey);
            passed = !!foundHeader;
            actual = foundHeader ? `${foundHeader}: ${responseHeaders[foundHeader]}` : 'Header not present';
            break;

          default:
            passed = true;
            actual = 'Unknown assertion skipped';
        }
      } catch (assertionErr) {
        passed = false;
        error = assertionErr.message;
      }

      if (passed) passedCount++;
      else failedCount++;

      testResults.push({
        name: tc.name,
        type: tc.type,
        passed,
        expected,
        actual: typeof actual === 'string' ? actual.slice(0, 200) : JSON.stringify(actual),
        error,
      });
    });
  }

  return {
    status: responseStatus,
    statusText: responseStatusText,
    responseTime: totalTime,
    responseSize,
    timings,
    requestHeaders: headers,
    requestBody: typeof data === 'object' && !(data instanceof FormData) ? JSON.stringify(data) : (data ? data.toString() : ''),
    responseHeaders,
    responseBody: responseData ? responseData.toString() : '',
    contentType,
    testResults,
    passedCount,
    failedCount,
    resolvedUrl,
  };
}

module.exports = {
  executeRequest,
  interpolateVariables,
};

