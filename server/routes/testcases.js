const express = require('express');
const TestCase = require('../models/TestCase');
const Environment = require('../models/Environment');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Helper function to substitute variables
function substituteVariables(str, variables) {
  if (!str || !variables) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const variable = variables.find(v => v.enabled && v.key === key);
    return variable ? variable.value : match;
  });
}

// Helper to evaluate assertions
function evaluateAssertions(response, assertions, envVariables) {
  const results = [];
  
  for (const assertion of assertions) {
    if (!assertion.isEnabled) {
      results.push({ assertion, result: 'skipped', message: 'Assertion disabled' });
      continue;
    }
    
    let actual;
    let passed = false;
    let message = '';
    
    try {
      switch (assertion.type) {
        case 'statusCode':
          actual = response.status;
          switch (assertion.operator) {
            case 'equals': passed = actual === assertion.expected; break;
            case 'notEquals': passed = actual !== assertion.expected; break;
            case 'greaterThan': passed = actual > assertion.expected; break;
            case 'lessThan': passed = actual < assertion.expected; break;
          }
          message = `Status code ${actual} ${assertion.operator} ${assertion.expected}`;
          break;
          
        case 'responseTime':
          actual = response.time;
          switch (assertion.operator) {
            case 'lessThan': passed = actual < assertion.expected; break;
            case 'greaterThan': passed = actual > assertion.expected; break;
            case 'equals': passed = actual === assertion.expected; break;
          }
          message = `Response time ${actual}ms ${assertion.operator} ${assertion.expected}ms`;
          break;
          
        case 'responseBodyContains':
          actual = JSON.stringify(response.data);
          const expectedStr = substituteVariables(assertion.expected, envVariables);
          if (assertion.operator === 'contains') {
            passed = actual.includes(expectedStr);
          } else if (assertion.operator === 'notContains') {
            passed = !actual.includes(expectedStr);
          }
          message = `Response body ${passed ? 'contains' : 'does not contain'} "${expectedStr}"`;
          break;
          
        case 'responseBodyEquals':
          actual = JSON.stringify(response.data);
          const expectedBody = substituteVariables(assertion.expected, envVariables);
          passed = actual === expectedBody;
          message = `Response body ${passed ? 'equals' : 'does not equal'} expected`;
          break;
          
        case 'responseHeaderExists':
          const headerKey = assertion.target.toLowerCase();
          actual = Object.keys(response.headers || {}).some(k => k.toLowerCase() === headerKey);
          passed = assertion.operator === 'exists' ? actual : !actual;
          message = `Header "${assertion.target}" ${passed ? 'exists' : 'does not exist'}`;
          break;
          
        case 'responseHeaderEquals':
          const headerValue = response.headers?.[assertion.target];
          actual = headerValue;
          const expectedHeader = substituteVariables(assertion.expected, envVariables);
          if (assertion.operator === 'equals') {
            passed = actual === expectedHeader;
          } else if (assertion.operator === 'contains') {
            passed = actual?.includes(expectedHeader);
          }
          message = `Header "${assertion.target}" ${passed ? 'matches' : 'does not match'}`;
          break;
          
        case 'jsonPath':
          // Simple JSON path evaluation (supports basic paths like $.data.id)
          const path = assertion.target.replace(/^\$\.?/, '').split('.');
          let value = response.data;
          for (const part of path) {
            if (value && typeof value === 'object' && part in value) {
              value = value[part];
            } else {
              value = undefined;
              break;
            }
          }
          actual = value;
          const expectedJson = substituteVariables(assertion.expected, envVariables);
          if (assertion.operator === 'equals') {
            passed = JSON.stringify(actual) === expectedJson;
          } else if (assertion.operator === 'contains') {
            passed = JSON.stringify(actual).includes(expectedJson);
          }
          message = `JSON path "${assertion.target}" ${passed ? 'matches' : 'does not match'}`;
          break;
      }
    } catch (e) {
      passed = false;
      message = `Assertion error: ${e.message}`;
    }
    
    results.push({ assertion, result: passed ? 'passed' : 'failed', actual, expected: assertion.expected, message });
  }
  
  return results;
}

// Get all test cases for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { collection, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };
    
    if (collection) query.collection = collection;
    
    const testCases = await TestCase.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('collection', 'name')
      .populate('environment', 'name');
    
    const total = await TestCase.countDocuments(query);
    
    res.json({ testCases, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

// Get single test case
router.get('/:id', authenticate, async (req, res) => {
  try {
    const testCase = await TestCase.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('collection', 'name')
      .populate('environment', 'name variables');
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    res.json(testCase);
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({ error: 'Failed to fetch test case' });
  }
});

// Create test case
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      name, description, collection, request, assertions, 
      environment, setupScript, teardownScript 
    } = req.body;
    
    if (!name || !request || !request.method || !request.url) {
      return res.status(400).json({ error: 'Name, method, and URL are required' });
    }
    
    const testCase = new TestCase({
      name,
      description,
      collection,
      request,
      assertions: assertions || [],
      environment,
      setupScript,
      teardownScript,
      user: req.user._id
    });
    
    await testCase.save();
    res.status(201).json(testCase);
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
});

// Update test case
router.put('/:id', authenticate, async (req, res) => {
  try {
    const testCase = await TestCase.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    const { 
      name, description, collection, request, assertions, 
      environment, setupScript, teardownScript, isActive 
    } = req.body;
    
    if (name) testCase.name = name;
    if (description !== undefined) testCase.description = description;
    if (collection !== undefined) testCase.collection = collection;
    if (request) testCase.request = request;
    if (assertions) testCase.assertions = assertions;
    if (environment !== undefined) testCase.environment = environment;
    if (setupScript !== undefined) testCase.setupScript = setupScript;
    if (teardownScript !== undefined) testCase.teardownScript = teardownScript;
    if (isActive !== undefined) testCase.isActive = isActive;
    
    await testCase.save();
    res.json(testCase);
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({ error: 'Failed to update test case' });
  }
});

// Delete test case
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const testCase = await TestCase.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    // Also delete test runs
    await TestCase.TestRun.deleteMany({ testCase: req.params.id });
    
    res.json({ message: 'Test case deleted' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ error: 'Failed to delete test case' });
  }
});

// Run test case
router.post('/:id/run', authenticate, async (req, res) => {
  try {
    const testCase = await TestCase.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('environment', 'variables');
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    if (!testCase.isActive) {
      return res.status(400).json({ error: 'Test case is disabled' });
    }
    
    // Get environment variables
    const envVariables = testCase.environment?.variables || [];
    
    // Build request
    const { request } = testCase;
    const urlObj = new URL(substituteVariables(request.url, envVariables));
    
    // Add params
    (request.params || []).filter(p => p.enabled && p.key).forEach(p => {
      urlObj.searchParams.append(
        substituteVariables(p.key, envVariables),
        substituteVariables(p.value, envVariables)
      );
    });
    
    const config = {
      method: request.method.toLowerCase(),
      url: urlObj.toString(),
      headers: {},
      timeout: 60000,
      validateStatus: () => true,
    };
    
    // Add headers
    (request.headers || []).filter(h => h.enabled && h.key).forEach(h => {
      config.headers[substituteVariables(h.key, envVariables)] = substituteVariables(h.value, envVariables);
    });
    
    // Handle authentication
    if (request.auth) {
      if (request.auth.type === 'bearer' && request.auth.token) {
        config.headers.Authorization = `Bearer ${substituteVariables(request.auth.token, envVariables)}`;
      } else if (request.auth.type === 'basic' && request.auth.username) {
        const encoded = Buffer.from(
          `${substituteVariables(request.auth.username, envVariables)}:${substituteVariables(request.auth.password || '', envVariables)}`
        ).toString('base64');
        config.headers.Authorization = `Basic ${encoded}`;
      } else if (request.auth.type === 'apikey' && request.auth.apiKey) {
        const keyName = substituteVariables(request.auth.apiKeyName, envVariables);
        const keyValue = substituteVariables(request.auth.apiKey, envVariables);
        if (request.auth.apiKeyIn === 'query') {
          urlObj.searchParams.append(keyName, keyValue);
          config.url = urlObj.toString();
        } else {
          config.headers[keyName] = keyValue;
        }
      }
    }
    
    // Add body
    if (request.body && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      let processedBody = substituteVariables(request.body, envVariables);
      
      if (request.bodyType === 'json') {
        try {
          config.data = JSON.parse(processedBody);
          config.headers['Content-Type'] = 'application/json';
        } catch (e) {
          config.data = processedBody;
        }
      } else if (request.bodyType === 'form') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.data = new URLSearchParams(processedBody);
      } else if (request.bodyType === 'xml') {
        config.headers['Content-Type'] = 'application/xml';
        config.data = processedBody;
      } else {
        config.data = processedBody;
      }
    }
    
    // Execute request
    const start = Date.now();
    let response;
    let error = null;
    
    try {
      response = await axios(config);
    } catch (err) {
      error = err;
      if (err.response) {
        response = err.response;
      }
    }
    
    const elapsed = Date.now() - start;
    
    const responseData = {
      status: response?.status || 0,
      statusText: response?.statusText || error?.message || 'Error',
      headers: response?.headers || {},
      data: response?.data,
      time: elapsed
    };
    
    // Evaluate assertions
    const assertionResults = evaluateAssertions(responseData, testCase.assertions, envVariables);
    const allPassed = assertionResults.every(r => r.result === 'passed' || r.result === 'skipped');
    
    // Update test case stats
    testCase.lastRun = new Date();
    testCase.lastStatus = allPassed ? 'passed' : 'failed';
    testCase.runCount += 1;
    if (allPassed) testCase.passCount += 1;
    else testCase.failCount += 1;
    await testCase.save();
    
    // Save test run
    const testRun = new TestCase.TestRun({
      testCase: testCase._id,
      user: req.user._id,
      status: allPassed ? 'passed' : 'failed',
      duration: elapsed,
      assertions: assertionResults,
      request: {
        method: config.method.toUpperCase(),
        url: config.url,
        headers: config.headers,
        body: config.data
      },
      response: {
        status: responseData.status,
        statusText: responseData.statusText,
        headers: responseData.headers,
        data: responseData.data,
        time: responseData.time
      },
      error: error?.message
    });
    
    await testRun.save();
    
    res.json({
      testRun,
      passed: allPassed,
      assertions: assertionResults
    });
  } catch (error) {
    console.error('Run test case error:', error);
    res.status(500).json({ error: 'Failed to run test case' });
  }
});

// Get test runs for a test case
router.get('/:id/runs', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const runs = await TestCase.TestRun.find({ testCase: req.params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await TestCase.TestRun.countDocuments({ testCase: req.params.id });
    
    res.json({ runs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get test runs error:', error);
    res.status(500).json({ error: 'Failed to fetch test runs' });
  }
});

module.exports = router;