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

  // 2. HEADERS: Content-Type for JSON payloads
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
        description: 'Server body parsers (like Express express.json()) may ignore or fail to parse JSON payloads if the Content-Type header is omitted.',
        action: {
          type: 'header',
          label: 'Add Content-Type Header',
          key: 'Content-Type',
          value: 'application/json',
        },
      });
    }
  }

  // 3. HEADERS: Explicit Accept Header
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

  // 4. SECURITY: Authentication Header
  const hasAuth = auth.type && auth.type !== 'none';
  if (!hasAuth && (status === 401 || status === 403 || ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method))) {
    suggestions.push({
      id: 'sug-auth-token',
      category: 'Security',
      severity: 'high',
      title: 'Configure Bearer Token or API Key Authentication',
      description: 'The endpoint appears to require authorization credentials. Add a Bearer token or configure an environment variable like {{token}} in the Auth tab.',
      action: {
        type: 'auth',
        label: 'Set Bearer Token ({{token}})',
        authType: 'bearer',
        token: '{{token}}',
      },
    });
  }

  // 5. PERFORMANCE: Latency Optimization & Caching
  if (responseTime > 300) {
    suggestions.push({
      id: 'sug-latency-opt',
      category: 'Performance',
      severity: responseTime > 1000 ? 'high' : 'medium',
      title: `Response Latency Optimization (${responseTime}ms)`,
      description: `Execution took ${responseTime}ms (exceeding 300ms SLA). Consider verifying server database indexing, utilizing HTTP caching ("Cache-Control: max-age=3600"), or using CDN edge caching.`,
      action: {
        type: 'header',
        label: 'Add Cache-Control Header',
        key: 'Cache-Control',
        value: 'max-age=3600',
      },
    });
  }

  // 6. TESTING: Status Code Regression Test
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

  // 7. TESTING: Performance SLA Assertion Test
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

  // 8. TESTING: Response Body Schema Contract Test
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

  // 9. PERFORMANCE: GZIP/Brotli Compression Header
  const hasAcceptEncoding = headers.some(
    (h) => (h.key || '').toLowerCase() === 'accept-encoding' && h.enabled !== false
  );
  if (!hasAcceptEncoding) {
    suggestions.push({
      id: 'sug-compression',
      category: 'Performance',
      severity: 'low',
      title: 'Enable Compression with "Accept-Encoding: gzip, br"',
      description: 'Instruct upstream servers to compress payloads using GZIP or Brotli, reducing network payload transfer size by up to 70%.',
      action: {
        type: 'header',
        label: 'Add Accept-Encoding Header',
        key: 'Accept-Encoding',
        value: 'gzip, deflate, br',
      },
    });
  }

  // 10. SECURITY: Connection Keep-Alive
  const hasKeepAlive = headers.some(
    (h) => (h.key || '').toLowerCase() === 'connection' && h.enabled !== false
  );
  if (!hasKeepAlive) {
    suggestions.push({
      id: 'sug-keep-alive',
      category: 'Performance',
      severity: 'low',
      title: 'Enable TCP Connection Reuse with "Connection: keep-alive"',
      description: 'Reuse underlying TCP connections across sequential collection runner executions to save 50-150ms of handshake latency per call.',
      action: {
        type: 'header',
        label: 'Add Connection: keep-alive',
        key: 'Connection',
        value: 'keep-alive',
      },
    });
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
  const headers = request.headers || [];
  const testResults = response.testResults || [];
  const failedTests = testResults.filter((t) => !t.passed);

  let issueTitle = '';
  let severity = 'warning';
  let rootCause = '';
  let solution = '';
  let explanation = '';
  let quickFix = null;
  let codeSnippet = '';

  // 1. NETWORK / CONNECTION ERROR (Status 0)
  if (status === 0 || statusText === 'Network Error') {
    severity = 'critical';
    issueTitle = 'Connection Failed / Network Error';
    rootCause =
      'The HTTP proxy or browser failed to establish a network connection with the destination server.';
    solution =
      '1. Verify the target server is online and reachable.\n2. Ensure the URL protocol (http:// or https://) and port number are accurate.\n3. Check if a local firewall or proxy is blocking outbound traffic.\n4. If testing local services, make sure localhost / 127.0.0.1 is running.';
    explanation = `Failed to connect to ${
      url || 'the specified host'
    }. Status 0 typically indicates DNS resolution failure, connection refused, or target process stopped.`;
    quickFix = {
      type: 'url',
      field: 'url',
      value: url.startsWith('http') ? url : `http://${url}`,
    };
  }
  // 2. UNAUTHORIZED (Status 401)
  else if (status === 401) {
    severity = 'critical';
    issueTitle = '401 Unauthorized: Missing or Invalid Authentication';
    rootCause =
      'The endpoint requires valid authentication credentials (e.g. Bearer Token, API Key, or Basic Auth), but the request lacked an acceptable Authorization header or the token was invalid/expired.';

    if (url.includes('/api/mock/auth-protected')) {
      solution =
        'Use the valid mock Bearer token: "test-secret-token" or environment variable {{token}} in the Authorization header.';
      quickFix = {
        type: 'auth',
        authType: 'bearer',
        token: 'test-secret-token',
      };
      codeSnippet = 'Authorization: Bearer test-secret-token';
    } else {
      solution =
        '1. Open the "Auth" tab in the Request Builder.\n2. Choose "Bearer Token" or "API Key" according to your API documentation.\n3. Verify your token has not expired and has appropriate permission scopes.';
      quickFix = {
        type: 'auth',
        authType: 'bearer',
        token: '{{token}}',
      };
      codeSnippet = 'Authorization: Bearer {{token}}';
    }
    explanation =
      'HTTP 401 indicates that the request has not been applied because it lacks valid authentication credentials for the target resource.';
  }
  // 3. FORBIDDEN (Status 403)
  else if (status === 403) {
    severity = 'critical';
    issueTitle = '403 Forbidden: Insufficient Permissions / Role Restriction';
    rootCause =
      'Authentication succeeded, but the authenticated user lacks the required role, permission scope, or whitelist privilege to access this resource.';
    solution =
      '1. Confirm your user account has administrative or appropriate role permissions.\n2. Verify API key scopes or tenant permissions.\n3. In whitelist-restricted endpoints, check if the requesting identity is on the authorized list.';
    explanation = 'Unlike 401, with 403 the server knows who you are, but refuses authorization.';
  }
  // 4. NOT FOUND (Status 404)
  else if (status === 404) {
    severity = 'warning';
    issueTitle = '404 Not Found: Endpoint or Resource Path Does Not Exist';
    rootCause = `The server could not find a matching route handler or document for path: ${url}.`;

    if (url.includes('/user') && !url.includes('/users')) {
      solution = 'The route might be pluralized: change "/user" to "/users".';
      quickFix = {
        type: 'url',
        field: 'url',
        value: url.replace('/user', '/users'),
      };
    } else {
      solution =
        '1. Double-check the path spelling and URL path parameters.\n2. Verify the HTTP method matches the endpoint registration (e.g. GET vs POST).\n3. Check if {{baseUrl}} resolves to the correct root address.';
    }
    explanation =
      'HTTP 404 indicates the origin server did not find a current representation for the target resource.';
  }
  // 5. BAD REQUEST / UNPROCESSABLE ENTITY (Status 400 or 422)
  else if (status === 400 || status === 422) {
    severity = 'warning';
    issueTitle = `${status} Bad Request: Invalid Payload or Missing Parameters`;

    let isMalformedJson = false;
    if (request.bodyType === 'json' && request.rawBody) {
      try {
        JSON.parse(request.rawBody);
      } catch (err) {
        isMalformedJson = true;
      }
    }

    if (isMalformedJson) {
      rootCause =
        'The request payload contains invalid JSON syntax (e.g. trailing comma, unquoted property names, or mismatched brackets).';
      solution = 'Fix the JSON formatting in the Body tab. Ensure all keys are double-quoted and brackets match.';
      quickFix = {
        type: 'body',
        bodyType: 'json',
      };
    } else if (
      responseBody.toLowerCase().includes('name') ||
      responseBody.toLowerCase().includes('email') ||
      responseBody.toLowerCase().includes('required')
    ) {
      rootCause =
        'Server rejected the request because one or more required fields were missing or invalid in the payload.';
      solution = 'Inspect the endpoint schema. Ensure required fields (e.g., name, email, role) are included in the JSON body.';
      codeSnippet = JSON.stringify({ name: 'John Doe', email: 'john@example.com', role: 'Developer' }, null, 2);
    } else {
      rootCause =
        'The server cannot process the request due to malformed request syntax, invalid parameters, or payload validation failure.';
      solution =
        '1. Inspect the request Body and Query Parameters.\n2. Confirm Header "Content-Type: application/json" is set.\n3. Match field types (string, number, boolean) with the API specification.';
    }
    explanation = 'HTTP 400/422 means the server cannot understand or validate the request syntax or semantic content.';
  }
  // 6. METHOD NOT ALLOWED (Status 405)
  else if (status === 405) {
    severity = 'warning';
    issueTitle = `405 Method Not Allowed: Endpoint does not support ${method}`;
    rootCause = `The endpoint ${url} exists, but it does not support HTTP method "${method}".`;
    solution = `Check your API documentation to confirm supported methods for this route (e.g., switch ${method} to GET, POST, or PUT).`;
  }
  // 7. SERVER ERROR (Status 500, 502, 503, 504)
  else if (status >= 500) {
    severity = 'critical';
    issueTitle = `${status} Server Error: Upstream Service Failure or Timeout`;
    rootCause = `The backend application or upstream proxy encountered an unhandled exception or timed out while processing this request.`;
    solution =
      '1. Inspect server logs for uncaught exceptions or database connection pool issues.\n2. Verify the server is not encountering an out-of-memory or high CPU bottleneck.\n3. Ensure payload size does not exceed server max body limits.';
    explanation = '5xx codes indicate the server encountered an error or was unable to fulfill an otherwise valid request.';
  }
  // 8. TEST ASSERTIONS FAILED (Status 2xx but failed assertions)
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
  // 9. SUCCESSFUL (Status 2xx)
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
