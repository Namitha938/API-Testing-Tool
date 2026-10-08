const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_testing_tool';
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully to: ${mongoUri}`);
    await seedInitialData();
  } catch (error) {
    console.error('[Database] MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

async function seedInitialData() {
  try {
    const User = require('../models/User');
    const Collection = require('../models/Collection');
    const SavedRequest = require('../models/SavedRequest');
    const Environment = require('../models/Environment');

    // Seed default admin if no users exist
    const userCount = await User.countDocuments();
    let adminUser;
    let demoUser;

    if (userCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@apitester.io',
        password: adminPassword,
        role: 'admin',
      });

      const demoPassword = await bcrypt.hash('user123', 10);
      demoUser = await User.create({
        name: 'Demo Developer',
        email: 'demo@apitester.io',
        password: demoPassword,
        role: 'user',
      });
      console.log('[Database] Seeded default Admin (admin@apitester.io) and Demo user (demo@apitester.io)');
    } else {
      adminUser = await User.findOne({ role: 'admin' });
      demoUser = await User.findOne({ email: 'demo@apitester.io' }) || adminUser;
    }

    // Seed default Environment if none exist
    const envCount = await Environment.countDocuments();
    if (envCount === 0 && adminUser) {
      await Environment.create({
        name: 'Local Dev Environment',
        userId: adminUser._id,
        isGlobal: true,
        variables: [
          { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
          { key: 'apiKey', value: 'live_prod_api_key_8899', enabled: true },
          { key: 'token', value: 'production_bearer_token_9900', enabled: true },
        ],
      });
      console.log('[Database] Seeded default Local Dev Environment');
    }

    // Seed default Starter Collection if none exist
    const colCount = await Collection.countDocuments();
    if (colCount === 0 && adminUser) {
      const starterCollection = await Collection.create({
        name: 'Mock API Showcase',
        description: 'Comprehensive suite of sample API requests demonstrating GET, POST, PUT, DELETE, XML, and Auth.',
        userId: adminUser._id,
        folders: [
          { id: 'f-users', name: 'User Management', description: 'User CRUD operations', parentId: null },
          { id: 'f-admin-users', name: 'Admin Controls', description: 'Privileged user actions', parentId: 'f-users' },
          { id: 'f-advanced', name: 'Advanced & Auth', description: 'Authentication and XML formats', parentId: null },
          { id: 'f-security', name: 'Security Protocols', description: 'Token and bearer authentication', parentId: 'f-advanced' },
          { id: 'f-xml-data', name: 'Data Formats (XML)', description: 'XML serialization endpoints', parentId: 'f-advanced' },
        ],
      });

      const sampleRequests = [
        {
          name: '1. Get All Users (GET)',
          collectionId: starterCollection._id,
          folderId: 'f-users',
          userId: adminUser._id,
          method: 'GET',
          url: '{{baseUrl}}/users',
          params: [{ key: 'page', value: '1', enabled: true }, { key: 'limit', value: '5', enabled: true }],
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
          auth: { type: 'none' },
          bodyType: 'none',
          rawBody: '',
          testCases: [
            { name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true },
            { name: 'Response time under 500ms', type: 'responseTime', expectedValue: '500', enabled: true },
            { name: 'Contains success property', type: 'jsonProp', expectedValue: 'success', enabled: true },
          ],
        },
        {
          name: '2. Create New User (POST)',
          collectionId: starterCollection._id,
          folderId: 'f-users',
          userId: adminUser._id,
          method: 'POST',
          url: '{{baseUrl}}/users',
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          auth: { type: 'none' },
          bodyType: 'json',
          rawBody: JSON.stringify({
            name: 'Sarah Connor',
            email: 'sarah.connor@cyberdyne.org',
            role: 'Security Engineer',
            status: 'active'
          }, null, 2),
          testCases: [
            { name: 'Status code is 201 Created', type: 'status', expectedValue: '201', enabled: true },
            { name: 'Response has user ID', type: 'jsonProp', expectedValue: 'data.id', enabled: true },
          ],
        },
        {
          name: '3. Update User (PUT)',
          collectionId: starterCollection._id,
          folderId: 'f-admin-users',
          userId: adminUser._id,
          method: 'PUT',
          url: '{{baseUrl}}/users/1',
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          bodyType: 'json',
          rawBody: JSON.stringify({
            name: 'Sarah Connor (Updated)',
            role: 'Lead Architect',
            status: 'active'
          }, null, 2),
          testCases: [
            { name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true },
          ],
        },
        {
          name: '4. Delete User (DELETE)',
          collectionId: starterCollection._id,
          folderId: 'f-admin-users',
          userId: adminUser._id,
          method: 'DELETE',
          url: '{{baseUrl}}/users/1',
          testCases: [
            { name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true },
          ],
        },
        {
          name: '5. Bearer Protected Endpoint (Auth)',
          collectionId: starterCollection._id,
          folderId: 'f-security',
          userId: adminUser._id,
          method: 'GET',
          url: '{{baseUrl}}/auth-protected',
          auth: { type: 'bearer', token: '{{token}}' },
          testCases: [
            { name: 'Status code is 200 Authorized', type: 'status', expectedValue: '200', enabled: true },
          ],
        },
        {
          name: '6. XML Response Viewer',
          collectionId: starterCollection._id,
          folderId: 'f-xml-data',
          userId: adminUser._id,
          method: 'GET',
          url: '{{baseUrl}}/xml',
          testCases: [
            { name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true },
            { name: 'Contains root XML tag', type: 'containsText', expectedValue: '<response>', enabled: true },
          ],
        },
        {
          name: '7. Latency & Performance Test',
          collectionId: starterCollection._id,
          folderId: 'f-advanced',
          userId: adminUser._id,
          method: 'GET',
          url: '{{baseUrl}}/delayed?ms=250',
          testCases: [
            { name: 'Status is 200', type: 'status', expectedValue: '200', enabled: true },
          ],
        },
      ];

      await SavedRequest.insertMany(sampleRequests);
      console.log('[Database] Seeded default Mock API Showcase requests');
    }
  } catch (err) {
    console.warn('[Database] Seeder notice:', err.message);
  }
}

module.exports = connectDB;

