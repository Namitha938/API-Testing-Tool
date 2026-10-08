const express = require('express');
const router = express.Router();
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');

/**
 * Intelligent Rule-Based & Generative AI Diagnostics Engine
 * Evaluates request, response, headers, payload, network timings, and test assertions.
 */
function analyzeApiIssue({ request = {}, response = {}, userPrompt = '' }) {
  const method = (request.method || 'GET').toUpperCase();
  const url = request.url || '';
  const status = response.status !== undefined ? response.status : 0;
  const statusText = response.statusText || '';
  const responseBody = typeof response.responseBody === 'string' ? response.responseBody : JSON.stringify(response.responseBody || '');
  const headers = request.headers || [];
  const auth = request.auth || {};
  const testResults = response.testResults || [];
  const failedTests = testResults.filter(t => !t.passed);

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
    rootCause = 'The HTTP proxy or browser failed to establish a network connection with the destination server.';
    solution = '1. Verify the target server is online and reachable.\n2. Ensure the URL protocol (http:// or https://) and port number are accurate.\n3. Check if a local firewall or proxy is blocking outbound traffic.\n4. If testing local services, make sure localhost / 127.0.0.1 is running.';
    explanation = `Failed to connect to ${url || 'the specified host'}. Status 0 typically indicates DNS resolution failure, connection refused, or target process stopped.`;
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
    rootCause = 'The endpoint requires valid authentication credentials (e.g. Bearer Token, API Key, or Basic Auth), but the request lacked an acceptable Authorization header or the token was invalid/expired.';
    
    if (url.includes('/api/mock/auth-protected')) {
      solution = 'Use the valid mock Bearer token: "test-secret-token" or environment variable {{token}} in the Authorization header.';
      quickFix = {
        type: 'auth',
        authType: 'bearer',
        token: 'test-secret-token',
      };
      codeSnippet = 'Authorization: Bearer test-secret-token';
    } else {
      solution = '1. Open the "Auth" tab in the Request Builder.\n2. Choose "Bearer Token" or "API Key" according to your API documentation.\n3. Verify your token has not expired and has appropriate permission scopes.';
      quickFix = {
        type: 'auth',
        authType: 'bearer',
        token: '{{token}}',
      };
      codeSnippet = 'Authorization: Bearer {{token}}';
    }
    explanation = 'HTTP 401 indicates that the request has not been applied because it lacks valid authentication credentials for the target resource.';
  }
  // 3. FORBIDDEN (Status 403)
  else if (status === 403) {
    severity = 'critical';
    issueTitle = '403 Forbidden: Insufficient Permissions / Role Restriction';
    rootCause = 'Authentication succeeded, but the authenticated user lacks the required role, permission scope, or whitelist privilege to access this resource.';
    solution = '1. Confirm your user account has administrative or appropriate role permissions.\n2. Verify API key scopes or tenant permissions.\n3. In whitelist-restricted endpoints, check if the requesting identity is on the authorized list.';
    explanation = 'Unlike 401, with 403 the server knows who you are, but refuses authorization.';
  }
  // 4. NOT FOUND (Status 404)
  else if (status === 404) {
    severity = 'warning';
    issueTitle = '404 Not Found: Endpoint or Resource Path Does Not Exist';
    rootCause = `The server could not find a matching route handler or document for path: ${url}.`;
    
    // Check common typo patterns
    if (url.includes('/users/') && !url.match(/\/users\/\d+/)) {
      solution = 'The path parameter for user ID might be missing or invalid. Format: /api/mock/users/:id (e.g. /api/mock/users/1).';
    } else if (url.includes('/user') && !url.includes('/users')) {
      solution = 'The route might be pluralized: change "/user" to "/users".';
      quickFix = {
        type: 'url',
        field: 'url',
        value: url.replace('/user', '/users'),
      };
    } else {
      solution = '1. Double-check the path spelling and URL path parameters.\n2. Verify the HTTP method matches the endpoint registration (e.g. GET vs POST).\n3. Check if {{baseUrl}} resolves to the correct root address.';
    }
    explanation = 'HTTP 404 indicates the origin server did not find a current representation for the target resource.';
  }
  // 5. BAD REQUEST / UNPROCESSABLE ENTITY (Status 400 or 422)
  else if (status === 400 || status === 422) {
    severity = 'warning';
    issueTitle = `${status} Bad Request: Invalid Payload or Missing Parameters`;
    
    // Check if JSON body might be malformed
    let isMalformedJson = false;
    if (request.bodyType === 'json' && request.rawBody) {
      try {
        JSON.parse(request.rawBody);
      } catch (err) {
        isMalformedJson = true;
      }
    }

    if (isMalformedJson) {
      rootCause = 'The request payload contains invalid JSON syntax (e.g. trailing comma, unquoted property names, or mismatched brackets).';
      solution = 'Fix the JSON formatting in the Body tab. Ensure all keys are double-quoted and brackets match.';
      quickFix = {
        type: 'body',
        bodyType: 'json',
      };
    } else if (responseBody.toLowerCase().includes('name') || responseBody.toLowerCase().includes('email') || responseBody.toLowerCase().includes('required')) {
      rootCause = 'Server rejected the request because one or more required fields were missing or invalid in the payload.';
      solution = 'Inspect the endpoint schema. Ensure required fields (e.g., name, email, role) are included in the JSON body.';
      codeSnippet = JSON.stringify({ name: 'John Doe', email: 'john@example.com', role: 'Developer' }, null, 2);
    } else {
      rootCause = 'The server cannot process the request due to malformed request syntax, invalid parameters, or payload validation failure.';
      solution = '1. Inspect the request Body and Query Parameters.\n2. Confirm Header "Content-Type: application/json" is set.\n3. Match field types (string, number, boolean) with the API specification.';
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
    solution = '1. Inspect server logs for uncaught exceptions or database connection pool issues.\n2. Verify the server is not encountering an out-of-memory or high CPU bottleneck.\n3. Ensure payload size does not exceed server max body limits.';
    explanation = '5xx codes indicate the server encountered an error or was unable to fulfill an otherwise valid request.';
  }
  // 8. TEST ASSERTIONS FAILED (Status 2xx but failed assertions)
  else if (failedTests.length > 0) {
    severity = 'warning';
    const failedNames = failedTests.map(t => `"${t.name}" (expected: ${t.expected}, got: ${t.actual})`).join(', ');
    issueTitle = `${failedTests.length} Automated Test Assertion(s) Failed`;
    rootCause = `The request completed with HTTP ${status}, but failed test assertions: ${failedNames}.`;
    
    const latencyFail = failedTests.find(t => t.type === 'responseTime');
    const statusFail = failedTests.find(t => t.type === 'status');
    const propFail = failedTests.find(t => t.type === 'jsonProp');

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
    solution = 'Your request is working as expected! You can add automated test assertions or save this request to your collection.';
    explanation = `Status ${status} ${statusText}. Response delivered in ${response.responseTime || 0}ms with payload size ${response.responseSize || 0} bytes.`;
  }

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
    failedAssertionsCount: failedTests.length,
    timestamp: new Date().toISOString(),
  };
}

// POST /api/ai/diagnose - Analyze request & response and provide AI solution
router.post('/diagnose', optionalAuth, async (req, res) => {
  try {
    const { request = {}, response = {}, userPrompt = '' } = req.body;

    // Check if user has Google Gemini API Key configured in environment
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let aiResult;

    if (geminiKey) {
      try {
        const promptText = `
You are an expert API testing engineer and backend debugging AI.
Analyze this API test execution and provide an intelligent diagnosis with concrete solutions.

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
Failed Test Assertions: ${JSON.stringify((response.testResults || []).filter(t => !t.passed))}

User Question: ${userPrompt || 'Why did this request fail and how do I fix it?'}

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
        console.warn('[AI Service] Gemini API call failed, using built-in intelligence engine:', geminiErr.message);
      }
    }

    // Fall back to expert built-in diagnostic engine
    if (!aiResult) {
      aiResult = analyzeApiIssue({ request, response, userPrompt });
    }

    res.json({
      success: true,
      diagnostic: aiResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI Diagnostic Engine encountered an error',
      error: error.message,
    });
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

    // 2. Latency SLA Assertion (current time + 250ms buffer)
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
