const express = require('express');
const router = express.Router();
const { executeRequest } = require('../services/requestExecutor');
const RequestHistory = require('../models/RequestHistory');
const Environment = require('../models/Environment');
const SavedRequest = require('../models/SavedRequest');
const { optionalAuth } = require('../middleware/auth');

// Helper to gather environment variables
async function getMergedVariables(userId, environmentId, customVariables = {}) {
  const merged = {};

  try {
    // 1. Get global environment variables
    const globals = await Environment.find({ isGlobal: true });
    globals.forEach(env => {
      env.variables.forEach(v => {
        if (v.enabled && v.key) merged[v.key] = v.value;
      });
    });

    // 2. Get specific active environment variables
    if (environmentId) {
      const activeEnv = await Environment.findById(environmentId);
      if (activeEnv) {
        activeEnv.variables.forEach(v => {
          if (v.enabled && v.key) merged[v.key] = v.value;
        });
      }
    }
  } catch (e) {
    console.warn('[Proxy] Error loading environment variables:', e.message);
  }

  // 3. Overlay any ad-hoc custom variables passed in request
  Object.assign(merged, customVariables);

  return merged;
}

// POST /api/proxy/execute - Run a single request
router.post('/execute', optionalAuth, async (req, res) => {
  try {
    const {
      method = 'GET',
      url,
      params = [],
      headers = [],
      auth = { type: 'none' },
      bodyType = 'none',
      rawBody = '',
      formData = [],
      testCases = [],
      environmentId = null,
      customVariables = {},
      savedRequestId = null,
    } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required.' });
    }

    const userId = req.user ? req.user._id : null;
    const envVars = await getMergedVariables(userId, environmentId, customVariables);

    // Execute request through executor engine
    const executionResult = await executeRequest(
      {
        method,
        url,
        params,
        headers,
        auth,
        bodyType,
        rawBody,
        formData,
        testCases,
      },
      envVars
    );

    // Save to RequestHistory if user exists
    if (userId) {
      try {
        await RequestHistory.create({
          userId,
          requestId: savedRequestId || null,
          method,
          url: executionResult.resolvedUrl || url,
          status: executionResult.status,
          statusText: executionResult.statusText,
          responseTime: executionResult.responseTime,
          responseSize: executionResult.responseSize,
          timings: executionResult.timings,
          requestHeaders: executionResult.requestHeaders,
          requestBody: executionResult.requestBody,
          responseHeaders: executionResult.responseHeaders,
          responseBody: executionResult.responseBody ? executionResult.responseBody.slice(0, 50000) : '',
          contentType: executionResult.contentType,
          testResults: executionResult.testResults,
          passedCount: executionResult.passedCount,
          failedCount: executionResult.failedCount,
        });
      } catch (histErr) {
        console.warn('[History] Could not save history:', histErr.message);
      }
    }

    res.json(executionResult);
  } catch (error) {
    res.status(500).json({
      message: 'Proxy execution failed',
      error: error.message,
    });
  }
});

// POST /api/proxy/run-collection - Automated API Test Runner
router.post('/run-collection', optionalAuth, async (req, res) => {
  try {
    const { collectionId, environmentId, delayMs = 100 } = req.body;
    if (!collectionId) {
      return res.status(400).json({ message: 'Collection ID is required for runner.' });
    }

    const requests = await SavedRequest.find({ collectionId }).sort({ createdAt: 1 });
    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: 'No requests found in this collection to run.' });
    }

    const userId = req.user ? req.user._id : null;
    const envVars = await getMergedVariables(userId, environmentId);

    const runnerResults = [];
    let totalTestsPassed = 0;
    let totalTestsFailed = 0;
    let totalResponseTime = 0;
    const runnerStartTime = Date.now();

    for (const reqItem of requests) {
      const execResult = await executeRequest(
        {
          method: reqItem.method,
          url: reqItem.url,
          params: reqItem.params,
          headers: reqItem.headers,
          auth: reqItem.auth,
          bodyType: reqItem.bodyType,
          rawBody: reqItem.rawBody,
          formData: reqItem.formData,
          testCases: reqItem.testCases,
        },
        envVars
      );

      totalTestsPassed += execResult.passedCount;
      totalTestsFailed += execResult.failedCount;
      totalResponseTime += execResult.responseTime;

      runnerResults.push({
        requestId: reqItem._id,
        name: reqItem.name,
        method: reqItem.method,
        url: execResult.resolvedUrl || reqItem.url,
        status: execResult.status,
        statusText: execResult.statusText,
        responseTime: execResult.responseTime,
        responseSize: execResult.responseSize,
        testResults: execResult.testResults,
        passedCount: execResult.passedCount,
        failedCount: execResult.failedCount,
      });

      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    const totalRunnerDuration = Date.now() - runnerStartTime;
    const avgResponseTime = Math.round(totalResponseTime / requests.length);

    res.json({
      collectionId,
      totalRequests: requests.length,
      totalRunnerDuration,
      avgResponseTime,
      totalTestsPassed,
      totalTestsFailed,
      allTestsPassed: totalTestsFailed === 0,
      results: runnerResults,
    });
  } catch (error) {
    res.status(500).json({ message: 'Collection runner failed', error: error.message });
  }
});

module.exports = router;

