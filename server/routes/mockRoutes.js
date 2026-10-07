const express = require('express');
const router = express.Router();

let mockUsers = [
  { id: 1, name: 'Alice Walker', email: 'alice@example.com', role: 'Frontend Engineer', status: 'active', department: 'Product' },
  { id: 2, name: 'Bob Roberts', email: 'bob@example.com', role: 'DevOps Specialist', status: 'active', department: 'Infrastructure' },
  { id: 3, name: 'Charlie Clark', email: 'charlie@example.com', role: 'QA Lead', status: 'inactive', department: 'Engineering' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Security Architect', status: 'active', department: 'Security' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Backend Developer', status: 'active', department: 'Engineering' },
];

// GET /api/mock/users
router.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = (req.query.search || '').toLowerCase();

  let filtered = mockUsers;
  if (search) {
    filtered = filtered.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
  }

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    page,
    limit,
    total: filtered.length,
    data: paginated,
  });
});

// GET /api/mock/users/:id
router.get('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found.` });
  }
  res.json({ success: true, data: user });
});

// POST /api/mock/users
router.post('/users', (req, res) => {
  const { name, email, role, department } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required fields.' });
  }

  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    role: role || 'Developer',
    department: department || 'Engineering',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);
  res.status(201).json({
    success: true,
    message: 'User created successfully in mock database',
    data: newUser,
  });
});

// PUT /api/mock/users/:id
router.put('/users/:id', (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found.` });
  }

  mockUsers[index] = {
    ...mockUsers[index],
    ...req.body,
    id: mockUsers[index].id,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: 'User replaced/updated successfully',
    data: mockUsers[index],
  });
});

// PATCH /api/mock/users/:id
router.patch('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found.` });
  }

  Object.assign(user, req.body);
  user.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'User patched successfully',
    data: user,
  });
});

// DELETE /api/mock/users/:id
router.delete('/users/:id', (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found.` });
  }

  const deleted = mockUsers.splice(index, 1)[0];
  res.json({
    success: true,
    message: `User ${deleted.name} (id: ${deleted.id}) deleted.`,
    data: deleted,
  });
});

// GET /api/mock/xml
router.get('/xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <code status="200">OK</code>
  <timestamp>${new Date().toISOString()}</timestamp>
  <payload>
    <item id="101">
      <name>Enterprise API Suite</name>
      <version>v2.4.0</version>
      <license>MIT</license>
    </item>
    <item id="102">
      <name>Automated Test Runner</name>
      <version>v1.1.0</version>
      <license>Apache-2.0</license>
    </item>
  </payload>
</response>`;
  res.send(xmlData);
});

// GET /api/mock/delayed
router.get('/delayed', async (req, res) => {
  const ms = Math.min(5000, parseInt(req.query.ms) || 500);
  await new Promise(r => setTimeout(r, ms));
  res.json({
    success: true,
    message: `Delayed response delivered successfully after ${ms}ms delay.`,
    delayAppliedMs: ms,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/mock/status/:code
router.all('/status/:code', (req, res) => {
  const statusCode = parseInt(req.params.code) || 200;
  res.status(statusCode).json({
    statusCode,
    message: `Simulated status code response: ${statusCode}`,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/mock/auth-protected
router.get('/auth-protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer test-secret-token') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Requires Bearer token "test-secret-token".',
      providedHeader: authHeader || 'none',
    });
  }

  res.json({
    success: true,
    message: 'Access granted! Authenticated with Bearer token successfully.',
    user: {
      username: 'agent_tester',
      role: 'security_auditor',
      scope: ['read:all', 'write:test'],
    },
  });
});

// GET /api/mock/echo
router.all('/echo', (req, res) => {
  res.json({
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

