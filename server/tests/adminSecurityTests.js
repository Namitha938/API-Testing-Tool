const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('=================================================================');
  console.log('🧪 RUNNING AUTOMATED ADMIN SECURITY & ACCESS SUITE');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // (b) An unauthenticated request gets 401
  await test('(b) Unauthenticated request to /api/admin/stats returns 401 Unauthorized', async () => {
    const res = await fetch(`${API_BASE}/admin/stats`);
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.message.includes('Authentication required') || data.message.includes('No token'), `Unexpected message: ${data.message}`);
  });

  await test('(b) Unauthenticated request to /api/admin/users returns 401 Unauthorized', async () => {
    const res = await fetch(`${API_BASE}/admin/users`);
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  // (e) Sign-up cannot create an admin
  let testUserToken = null;
  const testUserEmail = `normal_${Date.now()}@example.com`;
  await test('(e) Public sign-up cannot create an admin (forces role "user")', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Normal User',
        email: testUserEmail,
        password: 'User@123456',
        role: 'admin', // Malicious attempt to elevate role
      })
    });
    assert.strictEqual(res.status, 201, `Expected 201 created, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'user', `Expected role to be "user", but got "${data.user.role}"`);
    testUserToken = data.token;
  });

  // (a) A normal user calling an admin endpoint gets 403
  await test('(a) Authenticated normal user calling /api/admin/stats gets 403 Forbidden', async () => {
    assert.ok(testUserToken, 'Normal user token required');
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    assert.strictEqual(res.status, 403, `Expected 403, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.message.includes('Administrator privileges required'), `Unexpected message: ${data.message}`);
  });

  await test('(a) Authenticated normal user calling /api/admin/users gets 403 Forbidden', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    assert.strictEqual(res.status, 403, `Expected 403, got ${res.status}`);
  });

  // (f) The role cannot be changed by editing the client request (e.g. PUT /api/auth/profile)
  await test('(f) Role cannot be elevated by client profile update payload', async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        name: 'Hacked User',
        role: 'admin' // Attempted role tampering
      })
    });
    assert.strictEqual(res.status, 200, `Expected 200 profile updated, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'user', `Role must remain "user", got "${data.user.role}"`);
  });

  // (d) An admin sees the panel and can query admin endpoints
  let adminToken = null;
  await test('(d) Authorized admin logs in with admin credentials and gets role "admin"', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'singunamitha@gmail.com',
        password: 'Admin@2026!Secure'
      })
    });
    assert.strictEqual(res.status, 200, `Expected 200 login success, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'admin', `Expected admin role, got ${data.user.role}`);
    assert.ok(data.token, 'Token must be present');
    adminToken = data.token;
  });

  await test('(d) Authorized admin can successfully query /api/admin/stats', async () => {
    assert.ok(adminToken, 'Admin token required');
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.totalUsers !== undefined, 'totalUsers must be returned');
    assert.ok(data.totalCollections !== undefined, 'totalCollections must be returned');
  });

  await test('(d) Authorized admin can query /api/admin/users list', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Users list must be an array');
  });

  console.log('\n=================================================================');
  console.log(`📊 RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('=================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();

