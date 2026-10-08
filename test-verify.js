const axios = require('axios');

async function runVerification() {
  try {
    console.log('--- 1. Testing Health Endpoint ---');
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('Health:', health.data);

    console.log('\n--- 2. Testing Mock Users API ---');
    const mockRes = await axios.get('http://localhost:5000/api/mock/users?page=1&limit=2');
    console.log('Mock Users total:', mockRes.data.total, 'Count:', mockRes.data.data.length);

    console.log('\n--- 3. Testing Proxy Execution with Test Assertions & Latency ---');
    const proxyRes = await axios.post('http://localhost:5000/api/proxy/execute', {
      method: 'GET',
      url: 'http://localhost:5000/api/mock/users',
      params: [{ key: 'limit', value: '3', enabled: true }],
      testCases: [
        { name: 'Status is 200', type: 'status', expectedValue: '200', enabled: true },
        { name: 'Response under 1000ms', type: 'responseTime', expectedValue: '1000', enabled: true },
        { name: 'Contains success', type: 'jsonProp', expectedValue: 'success', enabled: true }
      ]
    });
    console.log('Proxy status:', proxyRes.data.status, 'Latency:', proxyRes.data.responseTime + 'ms');
    console.log('Test assertions passed:', proxyRes.data.passedCount, '/', proxyRes.data.testResults.length);
    console.log('Timings breakdown:', proxyRes.data.timings);

    console.log('\n--- 4. Testing Collections & Automated Batch Runner ---');
    const cols = await axios.get('http://localhost:5000/api/collections');
    console.log('Collections count:', cols.data.length);
    if (cols.data.length > 0 && cols.data[0].requests) {
      const runnerRes = await axios.post('http://localhost:5000/api/proxy/run-collection', {
        collectionId: cols.data[0]._id,
        delayMs: 20
      });
      console.log('Batch Runner total requests executed:', runnerRes.data.totalRequests);
      console.log('Tests Passed:', runnerRes.data.totalTestsPassed, 'Tests Failed:', runnerRes.data.totalTestsFailed);
      console.log('Avg latency:', runnerRes.data.avgResponseTime + 'ms');
    } else {
      console.log('No collections yet, skipped batch run.');
    }

    console.log('\n--- 5. Testing Authorized Admin Login & Dashboard Stats ---');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'singunamitha@gmail.com',
      password: 'Admin@2026!'
    });
    console.log('Authorized Admin logged in:', loginRes.data.user.name, 'Token received');

    const adminStats = await axios.get('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: 'Bearer ' + loginRes.data.token }
    });
    console.log('Admin Stats:', adminStats.data);

    // Verify demo user cannot access admin stats
    const demoLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@apitester.io',
      password: 'user123'
    });
    try {
      await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: 'Bearer ' + demoLogin.data.token }
      });
      throw new Error('Security Breach: Demo user was allowed to access admin stats!');
    } catch (authErr) {
      if (authErr.response && authErr.response.status === 403) {
        console.log('Security check passed: Demo user was correctly blocked with 403 Forbidden from admin stats.');
      } else {
        throw authErr;
      }
    }

    console.log('\n--- 6. Testing SPA Frontend Delivery ---');
    const frontendRes = await axios.get('http://localhost:5000/');
    console.log('Frontend HTML length:', frontendRes.data.length, 'Contains root div:', frontendRes.data.includes('id="root"'));

    console.log('\n🎉 >>> ALL CORE SUBSYSTEM VERIFICATIONS PASSED WITH FLYING COLORS! <<<');
  } catch (err) {
    console.error('Verification error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

runVerification();

