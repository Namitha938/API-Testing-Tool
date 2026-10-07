const express = require('express');
const History = require('../models/History');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get history for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, startDate, endDate } = req.query;
    const query = { user: req.user._id };
    
    if (search) {
      query.$or = [
        { 'request.url': { $regex: search, $options: 'i' } },
        { 'request.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('environment', 'name')
      .populate('collection', 'name');
    
    const total = await History.countDocuments(query);
    
    res.json({ history, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get single history entry
router.get('/:id', authenticate, async (req, res) => {
  try {
    const entry = await History.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('environment', 'name variables')
      .populate('collection', 'name');
    
    if (!entry) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Get history entry error:', error);
    res.status(500).json({ error: 'Failed to fetch history entry' });
  }
});

// Delete history entry
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const entry = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    res.json({ message: 'History entry deleted' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

// Clear all history
router.delete('/', authenticate, async (req, res) => {
  try {
    await History.deleteMany({ user: req.user._id });
    res.json({ message: 'History cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Re-run request from history
router.post('/:id/rerun', authenticate, async (req, res) => {
  try {
    const entry = await History.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('environment', 'variables');
    
    if (!entry) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    // This will be handled by the client using the request data
    res.json(entry.request);
  } catch (error) {
    console.error('Re-run error:', error);
    res.status(500).json({ error: 'Failed to re-run request' });
  }
});

module.exports = router;