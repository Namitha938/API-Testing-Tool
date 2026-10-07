const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const Collection = require('../models/Collection');
const Environment = require('../models/Environment');
const TestCase = require('../models/TestCase');
const History = require('../models/History');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRequests,
      totalCollections,
      totalEnvironments,
      totalTestCases,
      totalHistory,
      recentUsers,
      recentRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Request.countDocuments(),
      Collection.countDocuments(),
      Environment.countDocuments(),
      TestCase.countDocuments(),
      History.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Request.find().sort({ createdAt: -1 }).limit(10).populate('user', 'username')
    ]);
    
    // Requests by method
    const requestsByMethod = await Request.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Registrations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const registrationsOverTime = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Requests over time (last 30 days)
    const requestsOverTime = await Request.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totals: {
        users: totalUsers,
        activeUsers,
        requests: totalRequests,
        collections: totalCollections,
        environments: totalEnvironments,
        testCases: totalTestCases,
        history: totalHistory
      },
      recentUsers,
      recentRequests,
      requestsByMethod,
      usersByRole,
      registrationsOverTime,
      requestsOverTime
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get system health
router.get('/health', authenticate, authorize('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get database stats
    const dbStats = await mongoose.connection.db.stats();
    
    res.json({
      database: {
        status: dbStatus,
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error) {
    console.error('Admin health error:', error);
    res.status(500).json({ error: 'Failed to fetch health info' });
  }
});

// Get all users with pagination
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (admin)
router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ username, email, password, role: role || 'user' });
    await user.save();
    
    res.status(201).json({ id: user._id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin)
router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    await user.save();
    res.json({ id: user._id, username: user.username, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin)
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Clean up user data
    await Promise.all([
      Request.deleteMany({ user: req.params.id }),
      Collection.deleteMany({ user: req.params.id }),
      Environment.deleteMany({ user: req.params.id }),
      TestCase.deleteMany({ user: req.params.id }),
      History.deleteMany({ user: req.params.id })
    ]);
    
    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all requests (admin)
router.get('/requests', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, user, method } = req.query;
    const query = {};
    
    if (user) query.user = user;
    if (method) query.method = method;
    
    const requests = await Request.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Request.countDocuments(query);
    
    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get all collections (admin)
router.get('/collections', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const collections = await Collection.find()
      .populate('user', 'username email')
      .populate('requests', 'name method')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Collection.countDocuments();
    
    res.json({ collections, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get all environments (admin)
router.get('/environments', authenticate, authorize('admin'), async (req, res) => {
  try {
    const environments = await Environment.find()
      .populate('user', 'username email')
      .sort({ isGlobal: -1, name: 1 });
    
    res.json(environments);
  } catch (error) {
    console.error('Admin get environments error:', error);
    res.status(500).json({ error: 'Failed to fetch environments' });
  }
});

// Toggle global environment (admin)
router.put('/environments/:id/global', authenticate, authorize('admin'), async (req, res) => {
  try {
    const env = await Environment.findById(req.params.id);
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    env.isGlobal = !env.isGlobal;
    await env.save();
    
    res.json(env);
  } catch (error) {
    console.error('Admin toggle global env error:', error);
    res.status(500).json({ error: 'Failed to update environment' });
  }
});

// Delete environment (admin)
router.delete('/environments/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const env = await Environment.findByIdAndDelete(req.params.id);
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    res.json({ message: 'Environment deleted' });
  } catch (error) {
    console.error('Admin delete environment error:', error);
    res.status(500).json({ error: 'Failed to delete environment' });
  }
});

module.exports = router;