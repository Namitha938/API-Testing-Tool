const express = require('express');
const router = express.Router();
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');

/**
 * Generates proactive, actionable AI suggestions across Security, Performance, Testing, and Headers
 */
function generateApiSuggestions({ request = {}, response = {} }) {
  const suggestions = [];
  const method = (request.method || 'GET').toUpperCase();
  const url = request.url || '';
  const status = response.status !== undefined ? response.status : 0;
  const headers = request.headers || [];
  const resHeaders = response.responseHeaders || {};
  const responseTime = response.responseTime || 0;
  const auth = request.auth || {};
  const testCases = request.testCases || [];
  const resBodyStr = typeof response.responseBody === 'string'
    ? response.responseBody
    : JSON.stringify(response.responseBody || '');

  // 1. SECURITY: HTTPS Protocol Upgrade
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    suggestions.push({
      id: 'sug-https',
      category: 'Security',
      severity: 'high',
      title: 'Upgrade to Secure HTTPS Protocol',
      description: 'Your request is transmitting data over unencrypted HTTP. Switch to HTTPS to protect payload headers, parameters, and tokens from network eavesdropping.',
      action: {
        type: 'url',
        label: 'Upgrade URL to HTTPS',
        value: url.replace('http://', 'https://'),
      },
    });
  }

  // 2. HEADERS: User-Agent Header (crucial for real APIs like GitHub, Cloudflare, etc.)
  const hasUserAgent = headers.some(
    (h) => (h.key || '').toLowerCase() === 'user-agent' && h.enabled !== false
  );
  if (!hasUserAgent && (url.includes('github.com') || status === 403 || status === 401)) {
    suggestions.push({
      id: 'sug-user-agent',
      category: 'Headers',
      severity: 'high',
      title: 'Add "User-Agent" Header',
      description: 'Many production APIs (including GitHub, Cloudflare, and CDN protected endpoints) reject requests lacking a standard User-Agent header with HTTP 403 Forbidden.',
      action: {
        type: 'header',
        label: 'Add User-Agent: APITester/1.0',
        key: 'User-Agent',
        value: 'APITester-Client/1.0',
      },
    });
  }

  // 3. HEADERS: Content-Type for JSON payloads
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const hasContentType = headers.some(
      (h) => (h.key || '').toLowerCase() === 'content-type' && h.enabled !== false
    );
    if (!hasContentType) {
      suggestions.push({
        id: 'sug-content-type',
        category: 'Headers',
        severity: 'high',
        title: 'Specify "Content-Type: application/json" Header',
        description: 'Server body parsers (like Express express.json() or Spring @RequestBody) will reject or fail to parse JSON payloads without an explicit Content-Type header.',
        action: {
          type: 'header',
          label: 'Add Content-Type Header',
          key: 'Content-Type',
          value: 'application/json',
        },
      });
    }
  }

  // 4. HEADERS: Explicit Accept Header
  const hasAccept = headers.some(
    (h) => (h.key || '').toLowerCase() === 'accept' && h.enabled !== false
  );
  if (!hasAccept) {
    suggestions.push({
      id: 'sug-accept-header',
      category: 'Headers',
      severity: 'low',
      title: 'Specify Explicit "Accept: application/json" Header',
      description: 'Explicitly defining your accepted MIME type ensures upstream servers return formatted JSON instead of HTML error pages or XML fallback formats.',
      action: {
        type: 'header',
        label: 'Add Accept: application/json',
        key: 'Accept',
        value: 'application/json',
      },
    });
  }

  // 5. SECURITY: Authentication Header
  const hasAuth = auth.type && auth.type !== 'none';
  if (!hasAuth && (status === 401 || status === 403 || ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method))) {
    suggestions.push({
      id: 'sug-auth-token',
      category: 'Security',
      severity: 'high',
      title: 'Configure Bearer Token or API Key Authentication',
      description: 'The endpoint returned an authorization error or is a modifying action. Add a Bearer token or configure an environment variable like {{token}} in the Auth tab.',
      action: {
        type: 'auth',
        label: 'Set Bearer Token ({{token}})',
        authType: 'bearer',
        token: '{{token}}',
      },
    });
  }

  // 6. URL: Trailing Slash Adjustment
  if (status === 404 && url && !url.includes('?')) {
    if (url.endsWith('/')) {
      const fixedUrl = url.slice(0, -1);
      suggestions.push({
        id: 'sug-remove-slash',
        category: 'Routing',
        severity: 'medium',
        title: 'Remove Trailing Slash from URL',
        description: 'Some REST route routers (like Express or Django without APPEND_SLASH) strictly do not match URLs with trailing slashes.',
        action: {
          type: 'url',
          label: 'Strip Trailing Slash',
          value: fixedUrl,
        },
      });
    } else {
      const fixedUrl = url + '/';
      suggestions.push({
        id: 'sug-add-slash',
        category: 'Routing',
        severity: 'medium',
        title: 'Append Trailing Slash to URL',
        description: 'Certain frameworks (such as Django REST framework or FastAPI) strictly require a trailing slash on resource collection endpoints.',
        action: {
          type: 'url',
          label: 'Append Trailing Slash (/)',
          value: fixedUrl,
        },
      });
    }
  }

  // 7. PERFORMANCE: Latency Optimization & Caching
  if (responseTime > 400) {
    suggestions.push({
      id: 'sug-latency-opt',
      category: 'Performance',
      severity: responseTime > 1200 ? 'high' : 'medium',
      title: `Response Latency Optimization (${responseTime}ms)`,
      description: `Execution took ${responseTime}ms. Consider verifying server database indexing, utilizing HTTP caching ("Cache-Control: max-age=3600"), or using CDN edge caching.`,
      action: {
        type: 'header',
        label: 'Add Cache-Control Header',
        key: 'Cache-Control',
        value: 'max-age=3600',
      },
    });
  }

  // 8. TESTING: Status Code Regression Test
  const hasStatusTest = testCases.some((t) => t.type === 'status' && t.enabled !== false);
  if (!hasStatusTest && status > 0) {
    suggestions.push({
      id: 'sug-test-status',
      category: 'Testing',
      severity: 'medium',
      title: `Add Automated Status Code Test (${status} ${response.statusText || 'OK'})`,
      description: 'Ensure regression prevention by asserting that future executions return the expected HTTP status code.',
      action: {
        type: 'test',
        label: `Assert Status == ${status}`,
        test: {
          id: 'test-status-' + Date.now(),
          name: `Status code is ${status}`,
          type: 'status',
          expectedValue: String(status),
          enabled: true,
        },
      },
    });
  }

  // 9. TESTING: Performance SLA Assertion Test
  const hasLatencyTest = testCases.some((t) => t.type === 'responseTime' && t.enabled !== false);
  if (!hasLatencyTest && responseTime > 0) {
    const slaLimit = Math.max(Math.ceil((responseTime * 1.5) / 50) * 50, 300);
    suggestions.push({
      id: 'sug-test-latency',
      category: 'Testing',
      severity: 'low',
      title: `Add Performance SLA Test (<${slaLimit}ms)`,
      description: `Catch backend regressions early by asserting total roundtrip latency does not exceed ${slaLimit}ms.`,
      action: {
        type: 'test',
        label: `Assert Latency < ${slaLimit}ms`,
        test: {
          id: 'test-latency-' + Date.now(),
          name: `Response time under ${slaLimit}ms`,
          type: 'responseTime',
          expectedValue: String(slaLimit),
          enabled: true,
        },
      },
    });
  }

  // 10. TESTING: Response Body Schema Contract Test
  const hasPropTest = testCases.some((t) => t.type === 'jsonProp' && t.enabled !== false);
  if (!hasPropTest) {
    let candidateKey = null;
    if (typeof response.responseBody === 'object' && response.responseBody !== null) {
      if (Array.isArray(response.responseBody) && response.responseBody.length > 0) {
        candidateKey = Object.keys(response.responseBody[0])[0];
      } else {
        candidateKey = Object.keys(response.responseBody)[0];
      }
    } else if (typeof response.responseBody === 'string') {
      try {
        const parsed = JSON.parse(response.responseBody);
        candidateKey = Array.isArray(parsed) ? Object.keys(parsed[0] || {})[0] : Object.keys(parsed)[0];
      } catch (_) {}
    }

    if (candidateKey) {
      suggestions.push({
        id: 'sug-test-schema',
        category: 'Testing',
        severity: 'low',
        title: `Validate Response Contract for "${candidateKey}"`,
        description: `Verify that downstream clients will not break by checking that "${candidateKey}" is always present in the returned JSON body.`,
        action: {
          type: 'test',
          label: `Assert Body contains "${candidateKey}"`,
          test: {
            id: 'test-prop-' + Date.now(),
            name: `Body contains property "${candidateKey}"`,
            type: 'jsonProp',
            expectedValue: candidateKey,
            enabled: true,
          },
        },
      });
    }
  }

  return suggestions;
}

/**
 * Intelligent Rule-Based & Generative AI Diagnostics Engine
 * Evaluates request, response, headers, payload, network timings, and test assertions.
 */
function analyzeApiIssue({ request = {}, response = {}, userPrompt = '' }) {
  const method = (request.method || 'GET').toUpperCase();
  const url = request.url || '';
  const status = response.status !== undefined ? response.status : 0;
  const statusText = response.statusText || '';
  const responseBody =
    typeof response.responseBody === 'string'
      ? response.responseBody
      : JSON.stringify(response.responseBody || '');
  const lowerBody = responseBody.toLowerCase();
  const headers = request.headers || [];
  const testResults = response.testResults || [];
  const failedTests = testResults.filter((t) => !t.passed);
  const auth = request.auth || {};

  let issueTitle = '';
  let severity = 'warning';
  let rootCause = '';
  let solution = '';
  let explanation = '';
  let quickFix = null;
  let codeSnippet = '';

  // 1. NETWORK / CONNECTION ERROR (Status 0 or Network Error)
  if (status === 0 || statusText === 'Network Error' || status === 503 && responseBody.includes('ECONNREFUSED')) {
    severity = 'critical';
    issueTitle = 'Connection Failed / Network Error';
    rootCause =
      'The HTTP proxy failed to establish a network connection with the destination server. This occurs when the target host is unreachable, DNS failed to resolve, the port is closed, or an SSL/TLS handshake failed.';
    solution =
      '1. Verify the target server is online and listening on the designated port.\n2. Ensure the URL protocol (http:// or https://) is specified.\n3. If testing local backend (e.g. localhost:5000 or 127.0.0.1:8000), verify the local server process is active.\n4. Check if a firewall or VPN is intercepting network traffic.';
    explanation = `Failed to connect to ${
      url || 'the specified host'
    }. Status 0 / connection refused indicates the remote host refused the TCP connection or DNS resolution failed.`;
    quickFix = {
      type: 'url',
      field: 'url',
      label: 'Fix URL Protocol',
      value: url.startsWith('http') ? url : `http://${url}`,
    };
  }
  // 2. GITHUB SPECIFIC OR MISSING USER-AGENT 403
  else if (status === 403 && (lowerBody.includes('user-agent') || url.includes('github.com'))) {
    severity = 'critical';
    issueTitle = '403 Forbidden: Missing "User-Agent" Header';
    rootCause =
      'The API provider requires a standard "User-Agent" header to identify the client application. Requests without a User-Agent are automatically rejected by security policies.';
    solution =
      '1. Add the "User-Agent" header in the Headers tab.\n2. Set the value to an application identifier (e.g., "APITester-Client/1.0").\n3. Click "1-Click Apply Fix" below to automatically insert this header.';
    explanation =
      'Public APIs like GitHub, Reddit, and Cloudflare WAF protect against unidentifiable scrapers by enforcing User-Agent requirements.';
    quickFix = {
      type: 'header',
      key: 'User-Agent',
      value: 'APITester-Client/1.0',
      label: 'Add User-Agent Header',
    };
    codeSnippet = 'User-Agent: APITester-Client/1.0';
  }
  // 3. UNAUTHORIZED (Status 401)
  else if (status === 401) {
    severity = 'critical';
    issueTitle = '401 Unauthorized: Missing or Invalid Authentication';

    if (lowerBody.includes('expired') || lowerBody.includes('jwt expired') || lowerBody.includes('token_expired')) {
      rootCause = 'The authentication token provided in the Authorization header has expired.';
      solution =
        '1. Generate a refreshed access token from your authentication provider.\n2. Update the token in the "Auth" tab or update your environment variable {{token}}.\n3. Ensure your token refresh strategy is configured.';
    } else if (lowerBody.includes('bad credentials') || lowerBody.includes('invalid credentials')) {
      rootCause = 'The credentials or API token provided were rejected by the identity provider.';
      solution =
        '1. Double-check your username/password or API token.\n2. Verify the token has not been revoked or regenerated.\n3. Make sure there are no accidental spaces or linebreaks in the token string.';
    } else {
      rootCause =
        'The endpoint requires authentication (e.g. Bearer Token, API Key, or Basic Auth), but the request lacked valid credentials.';
      solution =
        '1. Open the "Auth" tab in the Request Builder.\n2. Choose "Bearer Token" or "API Key" as required by the API documentation.\n3. Set your token value or environment variable (e.g. {{token}}).\n4. Click "1-Click Apply Fix" to add a Bearer token template.';
    }

    quickFix = {
      type: 'auth',
      authType: 'bearer',
      token: '{{token}}',
      label: 'Configure Bearer Token ({{token}})',
    };
    codeSnippet = 'Authorization: Bearer <your_api_token_here>';
    explanation =
      'HTTP 401 indicates that the request lacked valid authentication credentials for the target resource.';
  }
  // 4. FORBIDDEN (Status 403)
  else if (status === 403) {
    severity = 'critical';
    issueTitle = '403 Forbidden: Insufficient Permissions or Role Restriction';
    rootCause =
      'Authentication was recognized, but the authenticated user lacks the required role, permission scope, or IP whitelist privilege to access this resource.';
    solution =
      '1. Verify your API key or token has the required OAuth scopes (e.g., repo, read:user, write:orders).\n2. Confirm your user account has administrative privileges.\n3. Check if IP allowlisting or CORS restrictions are active on the target server.';
    explanation =
      'Unlike 401, with 403 the server recognized the caller, but explicitly refused access due to policy restrictions.';
  }
  // 5. NOT FOUND (Status 404)
  else if (status === 404) {
    severity = 'warning';
    issueTitle = '404 Not Found: Endpoint or Resource Path Does Not Exist';
    rootCause = `The server could not find a matching route handler or document for path: ${url}.`;

    if (url.endsWith('/')) {
      const fixed = url.slice(0, -1);
      solution = `The server may not accept trailing slashes. Try testing the route without the trailing slash: ${fixed}`;
      quickFix = {
        type: 'url',
        value: fixed,
        label: 'Remove Trailing Slash',
      };
    } else if (!url.includes('?') && !url.endsWith('/') && !url.includes('.')) {
      const fixed = url + '/';
      solution = `1. Check if the route requires a trailing slash (e.g. ${fixed}).\n2. Verify path spelling and pluralization.\n3. Confirm the HTTP method matches the registered route.`;
      quickFix = {
        type: 'url',
        value: fixed,
        label: 'Try With Trailing Slash (/)',
      };
    } else {
      solution =
        '1. Double-check the URL path spelling and path parameters.\n2. Verify the HTTP method matches the route definition (e.g., GET vs POST).\n3. Check if your {{baseUrl}} environment variable resolves to the correct host and version prefix (e.g., /api/v1).';
    }
    explanation =
      'HTTP 404 indicates the origin server did not find a current representation for the target resource.';
  }
  // 6. BAD REQUEST / UNPROCESSABLE ENTITY (Status 400 or 422)
  else if (status === 400 || status === 422) {
    severity = 'warning';
    issueTitle = `${status} Bad Request: Invalid Payload or Missing Parameters`;

    let isMalformedJson = false;
    let jsonErrorMsg = '';
    if (request.bodyType === 'json' && request.rawBody) {
      try {
        JSON.parse(request.rawBody);
      } catch (err) {
        isMalformedJson = true;
        jsonErrorMsg = err.message;
      }
    }

    const hasContentType = headers.some(
      (h) => (h.key || '').toLowerCase() === 'content-type' && h.enabled !== false
    );

    if (isMalformedJson) {
      rootCause = `The request body contains invalid JSON syntax: ${jsonErrorMsg}. Common causes: trailing commas, single quotes instead of double quotes, or unescaped strings.`;
      solution = 'Fix the JSON syntax in the Body tab. Ensure all keys and strings are enclosed in double quotes ("") and commas are positioned correctly.';
      codeSnippet = '{\n  "key": "value",\n  "count": 10\n}';
      quickFix = {
        type: 'body',
        bodyType: 'json',
        label: 'Repair JSON Syntax',
        rawBody: request.rawBody
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']'),
      };
    } else if (!hasContentType && ['POST', 'PUT', 'PATCH'].includes(method)) {
      rootCause =
        'The server expected "Content-Type: application/json" to parse the request body, but no Content-Type header was supplied.';
      solution = 'Add the "Content-Type: application/json" header in the Headers tab or click the 1-Click Fix button below.';
      quickFix = {
        type: 'header',
        key: 'Content-Type',
        value: 'application/json',
        label: 'Add Content-Type Header',
      };
      codeSnippet = 'Content-Type: application/json';
    } else if (lowerBody.includes('required') || lowerBody.includes('validation')) {
      rootCause =
        'Server payload validation rejected the request. One or more mandatory fields were missing or had incorrect data types.';
      solution =
        'Inspect the error response body for validation messages. Ensure all required fields (e.g., email, name, password, id) are present with valid types in the Body tab.';
      explanation = 'Server-side validators (like Joi, Zod, or Express Validator) enforce strict data contract rules.';
    } else {
      rootCause =
        'The server cannot process the request due to malformed request syntax, invalid parameters, or payload validation failure.';
      solution =
        '1. Inspect the request Body and Query Parameters.\n2. Confirm Header "Content-Type: application/json" is set.\n3. Match field types (string, number, boolean) with the API specification.';
    }
    explanation = 'HTTP 400/422 means the server received the request but rejected its syntax or semantics.';
  }
  // 7. METHOD NOT ALLOWED (Status 405)
  else if (status === 405) {
    severity = 'warning';
    issueTitle = `405 Method Not Allowed: Endpoint does not accept ${method}`;
    rootCause = `The endpoint ${url} exists, but it does not support HTTP method "${method}".`;
    solution = `Check your API documentation to confirm supported methods for this route (e.g., switch ${method} to GET, POST, or PUT).`;
    explanation = 'HTTP 405 indicates that the request method is recognized by the server but is not supported by the target resource.';
    quickFix = {
      type: 'method',
      value: method === 'GET' ? 'POST' : 'GET',
      label: `Switch Method to ${method === 'GET' ? 'POST' : 'GET'}`,
    };
  }
  // 8. UNSUPPORTED MEDIA TYPE (Status 415)
  else if (status === 415) {
    severity = 'warning';
    issueTitle = '415 Unsupported Media Type: Incorrect Content-Type Header';
    rootCause = 'The server rejected the payload format because the Content-Type header does not match what the endpoint accepts.';
    solution = 'Set the "Content-Type" header to "application/json" (or the required format like multipart/form-data).';
    quickFix = {
      type: 'header',
      key: 'Content-Type',
      value: 'application/json',
      label: 'Add Content-Type: application/json',
    };
    codeSnippet = 'Content-Type: application/json';
  }
  // 9. RATE LIMITING (Status 429)
  else if (status === 429) {
    severity = 'critical';
    issueTitle = '429 Too Many Requests: Rate Limit Exceeded';
    rootCause = 'The client has sent too many requests in a given amount of time ("rate limiting").';
    solution =
      '1. Check response headers for "Retry-After" or "X-RateLimit-Reset".\n2. Introduce backoff or pauses between requests in the Collection Runner.\n3. Upgrade your API tier or cache responses to stay within rate quotas.';
    explanation = 'HTTP 429 indicates the client exceeded rate limit quotas enforced by the server or API gateway.';
  }
  // 10. SERVER ERROR (Status 500, 502, 503, 504)
  else if (status >= 500) {
    severity = 'critical';
    issueTitle = `${status} Server Error: Upstream Service Failure or Timeout`;
    rootCause =
      'The backend application or upstream proxy encountered an unhandled exception, crashed, or timed out while processing this request.';
    solution =
      '1. Inspect backend server logs for uncaught exceptions, null pointer errors, or database disconnections.\n2. If testing microservices, verify dependent downstream services are healthy.\n3. Verify request payload size is within server limits.';
    explanation = '5xx codes indicate the server encountered an error and was unable to fulfill an otherwise valid request.';
  }
  // 11. TEST ASSERTIONS FAILED (Status 2xx but failed assertions)
  else if (failedTests.length > 0) {
    severity = 'warning';
    const failedNames = failedTests
      .map((t) => `"${t.name}" (expected: ${t.expected}, got: ${t.actual})`)
      .join(', ');
    issueTitle = `${failedTests.length} Automated Test Assertion(s) Failed`;
    rootCause = `The request completed with HTTP ${status}, but failed test assertions: ${failedNames}.`;

    const latencyFail = failedTests.find((t) => t.type === 'responseTime');
    const statusFail = failedTests.find((t) => t.type === 'status');
    const propFail = failedTests.find((t) => t.type === 'jsonProp');

    if (statusFail) {
      solution = `The endpoint returned status ${response.status} instead of expected ${statusFail.expected}. Update the test case expected status or resolve the underlying HTTP response.`;
    } else if (latencyFail) {
      solution = `Execution took ${response.responseTime}ms which exceeded your threshold of ${latencyFail.expected}ms. Optimize backend database queries or increase SLA tolerance.`;
    } else if (propFail) {
      solution = `Property "${propFail.expected}" was not found in the response body. Check property path or review the response schema.`;
    } else {
      solution = 'Review the failed assertion rules in the "Tests" tab and adjust expected values or payloads.';
    }
    explanation = 'Test assertions enforce regression testing and SLA compliance across your API test suites.';
  }
  // 12. SUCCESSFUL (Status 2xx)
  else {
    severity = 'info';
    issueTitle = 'Request Executed Successfully (No Errors Detected)';
    rootCause = 'All network round-trips, headers, and payload serializations completed normally.';
    solution =
      'Your request is working as expected! You can add automated test assertions or save this request to your collection.';
    explanation = `Status ${status} ${statusText}. Response delivered in ${
      response.responseTime || 0
    }ms with payload size ${response.responseSize || 0} bytes.`;
  }

  const suggestions = generateApiSuggestions({ request, response });

  return {
    issue: issueTitle,
    severity,
    status,
    method,
    url,
    rootCause,
    solution,
    explanation,
    codeSnippet,
    quickFix,
    suggestions,
    failedAssertionsCount: failedTests.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates an interactive contextual chat reply for the AI Assistant drawer.
 * If Gemini API key is available, calls Gemini 1.5 Flash.
 * If not, uses our built-in Expert API Testing Copilot engine.
 */
async function generateAiChatResponse({ message = '', history = [], request = {}, response = {} }) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const method = (request.method || 'GET').toUpperCase();
  const url = request.url || '';
  const status = response.status !== undefined ? response.status : 0;
  const statusText = response.statusText || '';
  const responseBody = typeof response.responseBody === 'string'
    ? response.responseBody
    : JSON.stringify(response.responseBody || '');
  const lowerMsg = message.toLowerCase();

  // If Gemini key exists, call Gemini
  if (geminiKey) {
    try {
      const historyContext = history
        .map((h) => `${h.role === 'user' ? 'Developer' : 'AI Assistant'}: ${h.content}`)
        .join('\n');

      const systemPrompt = `
You are APITester Studio's AI Assistant, an elite senior backend and API testing engineer.
A developer is testing real APIs and is asking for your assistance with their active request and response.

ACTIVE REQUEST CONTEXT:
- Method: ${method}
- URL: ${url}
- Headers: ${JSON.stringify(request.headers || [])}
- Auth Config: ${JSON.stringify(request.auth || {})}
- Query Params: ${JSON.stringify(request.params || [])}
- Body Type: ${request.bodyType || 'none'}
- Body Content: ${typeof request.rawBody === 'string' ? request.rawBody.substring(0, 1000) : ''}

ACTIVE RESPONSE CONTEXT:
- Status Code: ${status} ${statusText}
- Latency: ${response.responseTime || 0}ms
- Size: ${response.responseSize || 0} bytes
- Response Headers: ${JSON.stringify(response.responseHeaders || {})}
- Response Body: ${responseBody.substring(0, 1500)}
- Test Assertions: ${JSON.stringify(response.testResults || [])}

CONVERSATION HISTORY:
${historyContext}

USER'S CURRENT QUESTION:
"${message}"

INSTRUCTIONS:
1. Provide a direct, actionable, practical solution formatted in clean markdown.
2. If this is an error (4xx, 5xx, or Status 0), pinpoint the exact root cause from the response and headers.
3. Include specific code/cURL snippets or header configurations when applicable.
4. If an automated fix can be applied to the request (e.g. adding a header, fixing the URL, configuring a Bearer token, formatting JSON), mention it clearly.
`;

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        },
        { timeout: 9000 }
      );

      const geminiReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (geminiReply) {
        // Also compute potential quick fix
        const diagnostic = analyzeApiIssue({ request, response });
        return {
          reply: geminiReply,
          quickFix: diagnostic.quickFix,
          source: 'gemini-1.5-flash',
        };
      }
    } catch (err) {
      console.warn('[AI Assistant] Gemini API call fallback to built-in copilot:', err.message);
    }
  }

  // Built-in Expert API Testing Copilot Engine
  const diagnostic = analyzeApiIssue({ request, response });
  let reply = '';
  let quickFix = diagnostic.quickFix;

  // 1. Diagnosis / "Why did it fail?" / Error explanation
  if (
    lowerMsg.includes('why') ||
    lowerMsg.includes('fail') ||
    lowerMsg.includes('error') ||
    lowerMsg.includes('diagnos') ||
    lowerMsg.includes('issue') ||
    lowerMsg.includes('problem')
  ) {
    if (status >= 400 || status === 0) {
      reply = `### 🔍 Issue Diagnosis: ${diagnostic.issue}\n\n` +
        `**Status**: \`${status} ${statusText}\` | **Method**: \`${method}\` | **URL**: \`${url}\`\n\n` +
        `#### 📌 Root Cause\n${diagnostic.rootCause}\n\n` +
        `#### 🛠️ Recommended Action Steps\n${diagnostic.solution}\n\n` +
        (diagnostic.codeSnippet ? `#### 💡 Code / Header Fix\n\`\`\`http\n${diagnostic.codeSnippet}\n\`\`\`\n\n` : '') +
        `*Click the **1-Click Apply Fix** button below to apply this resolution directly to your Request Builder.*`;
    } else {
      reply = `### ✅ Request Status: ${status} ${statusText}\n\n` +
        `The active request executed successfully in **${response.responseTime || 0}ms** without HTTP errors.\n\n` +
        `If you need help creating automated assertions, configuring environment variables, or testing edge cases, let me know!`;
    }
  }
  // 2. Authentication / Authorization help
  else if (
    lowerMsg.includes('auth') ||
    lowerMsg.includes('token') ||
    lowerMsg.includes('bearer') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('401') ||
    lowerMsg.includes('403')
  ) {
    reply = `### 🔐 Authentication Guide for ${url || 'Current Endpoint'}\n\n` +
      `To authorize requests with this API:\n\n` +
      `1. **Bearer Token (JWT)**:\n` +
      `   - Navigate to the **Auth** tab in the Request Builder.\n` +
      `   - Select **Bearer Token** as the Type.\n` +
      `   - Paste your JWT or reference an environment variable like \`{{token}}\`.\n\n` +
      `2. **API Key in Header**:\n` +
      `   - Select **API Key** in the Auth tab.\n` +
      `   - Set the Key name (e.g. \`X-API-Key\` or \`apiKey\`) and Value.\n\n` +
      `3. **Environment Variables**:\n` +
      `   - Open the **Environments** modal from the navbar to store your secrets safely without hardcoding them in URLs.`;

    quickFix = {
      type: 'auth',
      authType: 'bearer',
      token: '{{token}}',
      label: 'Set Bearer Token ({{token}})',
    };
  }
  // 3. cURL command generation
  else if (
    lowerMsg.includes('curl') ||
    lowerMsg.includes('bash') ||
    lowerMsg.includes('terminal') ||
    lowerMsg.includes('command')
  ) {
    let curlCmd = `curl -X ${method} "${url}"`;
    (request.headers || []).forEach((h) => {
      if (h.enabled !== false && h.key) {
        curlCmd += ` \\\n  -H "${h.key}: ${h.value}"`;
      }
    });
    if (request.auth?.type === 'bearer' && request.auth?.token) {
      curlCmd += ` \\\n  -H "Authorization: Bearer ${request.auth.token}"`;
    }
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.rawBody) {
      const sanitized = request.rawBody.replace(/"/g, '\\"');
      curlCmd += ` \\\n  -d "${sanitized}"`;
    }

    reply = `### 📜 Generated cURL Command\n\n` +
      `You can run this exact request in your command terminal or CI/CD runner:\n\n` +
      `\`\`\`bash\n${curlCmd}\n\`\`\`\n\n` +
      `*Tip: You can also import cURL commands anytime using the **cURL** button in the top navbar.*`;
  }
  // 4. Test assertion generation
  else if (
    lowerMsg.includes('test') ||
    lowerMsg.includes('assert') ||
    lowerMsg.includes('assertion')
  ) {
    reply = `### 🧪 Automated Test Suite Recommendations\n\n` +
      `For endpoint \`${method} ${url}\`, recommended assertions include:\n\n` +
      `1. **Status Code Verification**: Assert HTTP Status is \`${status || 200}\`.\n` +
      `2. **Performance SLA**: Assert Round-trip latency is under \`${Math.max(500, Math.ceil((response.responseTime || 200) * 1.5))}ms\`.\n` +
      `3. **Payload Contract**: Assert body contains essential JSON properties and matches schema.\n\n` +
      `*Click **+ Generate Tests** in the Response tab or ask me to inject test assertions into your request.*`;
  }
  // 5. CORS / Network / SSL errors
  else if (
    lowerMsg.includes('cors') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('ssl') ||
    lowerMsg.includes('connection')
  ) {
    reply = `### 🌐 CORS & Network Troubleshooting\n\n` +
      `When testing APIs from web clients:\n\n` +
      `- **CORS Preflight**: Browsers block cross-origin requests unless the target server returns \`Access-Control-Allow-Origin: *\` or your origin.\n` +
      `- **Backend Proxy**: APITester Studio includes a built-in proxy server that automatically bypasses browser CORS restrictions when testing!\n` +
      `- **Self-Signed SSL**: If testing internal HTTPS servers, make sure the SSL certificate is recognized or use HTTP locally.\n` +
      `- **Localhost**: Ensure your local microservice is running and listening on the designated port (e.g. \`http://127.0.0.1:5000\`).`;
  }
  // 6. General / Fallback API Assistant guidance
  else {
    reply = `### 🤖 APITester Copilot\n\n` +
      `I am analyzing your active API test execution:\n` +
      `- **Target**: \`${method} ${url || '(No URL provided)'}\`\n` +
      `- **Result**: \`${status} ${statusText || 'Pending Execution'}\`\n` +
      `- **Latency**: \`${response.responseTime || 0}ms\`\n\n` +
      (status >= 400
        ? `**Notice**: This request failed with HTTP ${status}. ${diagnostic.rootCause}\n\n**Action Step**: ${diagnostic.solution}`
        : `Everything looks clean and ready. You can test headers, query parameters, payloads, or run collection test suites.`) +
      `\n\nFeel free to ask me:\n` +
      `- *"Why did this request fail?"*\n` +
      `- *"How do I fix this status code?"*\n` +
      `- *"Generate a cURL command"*;\n` +
      `- *"Suggest automated test assertions"*`;
  }

  return {
    reply,
    quickFix,
    source: 'builtin-expert-copilot',
  };
}

// POST /api/ai/diagnose - Analyze request & response and provide AI diagnosis & suggestions
router.post('/diagnose', optionalAuth, async (req, res) => {
  try {
    const { request = {}, response = {}, userPrompt = '' } = req.body;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let aiResult;

    if (geminiKey) {
      try {
        const promptText = `
You are an expert API testing engineer and backend debugging AI.
Analyze this API test execution and provide an intelligent diagnosis with concrete solutions and improvement suggestions.

REQUEST:
Method: ${request.method}
URL: ${request.url}
Headers: ${JSON.stringify(request.headers || [])}
Auth: ${JSON.stringify(request.auth || {})}
Body Type: ${request.bodyType}
Body: ${typeof request.rawBody === 'string' ? request.rawBody.substring(0, 500) : ''}

RESPONSE:
Status: ${response.status} ${response.statusText}
Latency: ${response.responseTime}ms
Size: ${response.responseSize} bytes
Headers: ${JSON.stringify(response.responseHeaders || {})}
Body: ${typeof response.responseBody === 'string' ? response.responseBody.substring(0, 1000) : ''}
Failed Test Assertions: ${JSON.stringify((response.testResults || []).filter((t) => !t.passed))}

User Question: ${userPrompt || 'Why did this request fail and what are best practice suggestions?'}

Respond with JSON adhering to this schema:
{
  "issue": "Brief title of the issue",
  "severity": "critical" | "warning" | "info",
  "rootCause": "Detailed root cause explanation",
  "solution": "Step-by-step actionable solution",
  "codeSnippet": "Suggested code, header, or payload fix snippet (optional)",
  "explanation": "Contextual educational guidance"
}
`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json' },
          },
          { timeout: 8000 }
        );

        const rawReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawReply) {
          aiResult = JSON.parse(rawReply);
        }
      } catch (geminiErr) {
        console.warn('[AI Service] Gemini API call fallback to built-in rule engine:', geminiErr.message);
      }
    }

    if (!aiResult) {
      aiResult = analyzeApiIssue({ request, response, userPrompt });
    } else {
      const fallback = analyzeApiIssue({ request, response, userPrompt });
      aiResult.quickFix = fallback.quickFix;
      aiResult.suggestions = generateApiSuggestions({ request, response });
    }

    res.json({
      success: true,
      diagnostic: aiResult,
      suggestions: aiResult.suggestions || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI Diagnostic Engine encountered an error',
      error: error.message,
    });
  }
});

// POST /api/ai/chat - Interactive AI Assistant conversation endpoint
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message = '', history = [], request = {}, response = {} } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const chatResponse = await generateAiChatResponse({ message, history, request, response });

    res.json({
      success: true,
      reply: chatResponse.reply,
      quickFix: chatResponse.quickFix,
      source: chatResponse.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI Assistant Chat failed to process request',
      error: error.message,
    });
  }
});

// POST /api/ai/suggestions - Dedicated route to fetch smart proactive suggestions
router.post('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { request = {}, response = {} } = req.body;
    const suggestions = generateApiSuggestions({ request, response });
    res.json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate suggestions', error: error.message });
  }
});

// POST /api/ai/generate-tests - Auto-generate test assertions for an API response
router.post('/generate-tests', optionalAuth, async (req, res) => {
  try {
    const { status = 200, responseBody = '', responseTime = 100 } = req.body;

    const generatedTests = [];

    // 1. Status Code Assertion
    generatedTests.push({
      id: 'test-' + Date.now() + '-1',
      name: `Status code is ${status}`,
      type: 'status',
      expectedValue: String(status),
      enabled: true,
    });

    // 2. Latency SLA Assertion
    const targetLatency = Math.max(Math.ceil((responseTime + 150) / 100) * 100, 300);
    generatedTests.push({
      id: 'test-' + Date.now() + '-2',
      name: `Response time under ${targetLatency}ms`,
      type: 'responseTime',
      expectedValue: String(targetLatency),
      enabled: true,
    });

    // 3. Inspect JSON properties if applicable
    if (typeof responseBody === 'string' && responseBody.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(responseBody);
        const topKeys = Object.keys(parsed).slice(0, 3);
        topKeys.forEach((key, idx) => {
          generatedTests.push({
            id: `test-${Date.now()}-${3 + idx}`,
            name: `Body contains property "${key}"`,
            type: 'jsonProp',
            expectedValue: key,
            enabled: true,
          });
        });
      } catch (_) {}
    } else if (typeof responseBody === 'string' && responseBody.includes('<')) {
      generatedTests.push({
        id: 'test-' + Date.now() + '-3',
        name: 'Contains valid XML root tag',
        type: 'containsText',
        expectedValue: '<',
        enabled: true,
      });
    }

    res.json({
      success: true,
      message: `Generated ${generatedTests.length} automated test assertions!`,
      tests: generatedTests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate test assertions', error: error.message });
  }
});

module.exports = router;
