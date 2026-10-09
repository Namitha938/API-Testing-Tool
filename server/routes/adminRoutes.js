const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Collection = require('../models/Collection');
const SavedRequest = require('../models/SavedRequest');
const RequestHistory = require('../models/RequestHistory');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - System-wide dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalCollections = await Collection.countDocuments();
    const totalSavedRequests = await SavedRequest.countDocuments();
    const totalExecutions = await RequestHistory.countDocuments();

    // Calculate response time average & status code breakdown
    const recentHistory = await RequestHistory.find().sort({ createdAt: -1 }).limit(200);

    let totalResponseTime = 0;
    let testsPassed = 0;
    let testsFailed = 0;
    const statusCodes = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };

    recentHistory.forEach(h => {
      totalResponseTime += h.responseTime || 0;
      testsPassed += h.passedCount || 0;
      testsFailed += h.failedCount || 0;

      const code = h.status;
      if (code >= 200 && code < 300) statusCodes['2xx']++;
      else if (code >= 300 && code < 400) statusCodes['3xx']++;
      else if (code >= 400 && code < 500) statusCodes['4xx']++;
      else if (code >= 500) statusCodes['5xx']++;
    });

    const avgResponseTime = recentHistory.length ? Math.round(totalResponseTime / recentHistory.length) : 0;
    const testPassRate = (testsPassed + testsFailed) > 0 ? Math.round((testsPassed / (testsPassed + testsFailed)) * 100) : 100;

    res.json({
      totalUsers,
      activeUsers,
      totalCollections,
      totalSavedRequests,
      totalExecutions,
      avgResponseTime,
      testPassRate,
      testsPassed,
      testsFailed,
      statusCodes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
  }
});

// GET /api/admin/users - User management list with usage metadata
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const collectionsCount = await Collection.countDocuments({ userId: u._id });
        const executionsCount = await RequestHistory.countDocuments({ userId: u._id });

        return {
          ...u.toJSON(),
          collectionsCount,
          executionsCount,
        };
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const ALLOWED_ADMIN_EMAILS = [
      'singunamitha@gmail.com',
      's.v.padmavathi2005@gmail.com',
    ];
    if (role === 'admin' && !ALLOWED_ADMIN_EMAILS.includes((targetUser.email || '').toLowerCase().trim())) {
      return res.status(403).json({
        message: 'Only authorized accounts (singunamitha@gmail.com and s.v.padmavathi2005@gmail.com) can be granted admin privileges.'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({ message: 'User role updated successfully', user: targetUser.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

// PUT /api/admin/users/:id/status - Toggle active/suspended
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Prevent admin from suspending themselves
    if (req.user._id.toString() === req.params.id && status === 'suspended') {
      return res.status(400).json({ message: 'Cannot suspend your own admin account.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User status updated successfully', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up user's collections, saved requests, history
    await Collection.deleteMany({ userId: req.params.id });
    await SavedRequest.deleteMany({ userId: req.params.id });
    await RequestHistory.deleteMany({ userId: req.params.id });

    res.json({ message: 'User and all associated data deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// GET /api/admin/history - Get system-wide audit telemetry & execution history
router.get('/history', async (req, res) => {
  try {
    const history = await RequestHistory.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    const formattedHistory = history.map(h => ({
      _id: h._id,
      method: h.method,
      url: h.url,
      status: h.status,
      statusText: h.statusText || (h.status === 200 ? 'OK' : 'Completed'),
      responseTime: h.responseTime || 0,
      responseSize: h.responseSize || 0,
      headers: h.headers || {},
      responseBody: h.responseBody || null,
      error: h.error || null,
      passedCount: h.passedCount || 0,
      failedCount: h.failedCount || 0,
      user: h.userId ? { name: h.userId.name, email: h.userId.email, role: h.userId.role } : null,
      createdAt: h.createdAt,
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin history', error: error.message });
  }
});

// DELETE /api/admin/history/clear - Clear all execution history
router.delete('/history/clear', async (req, res) => {
  try {
    await RequestHistory.deleteMany({});
    res.json({ message: 'System request history cleared successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear history', error: error.message });
  }
});

module.exports = router;

