const express = require('express');
const router = express.Router();
const RequestHistory = require('../models/RequestHistory');
const { optionalAuth } = require('../middleware/auth');

// GET /api/history - Get recent request history
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query = req.user ? { userId: req.user._id } : {};
    const limit = parseInt(req.query.limit) || 50;

    const history = await RequestHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

// GET /api/history/:id - Get single history item
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await RequestHistory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'History record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history record', error: error.message });
  }
});

// DELETE /api/history/clear - Clear all history
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const query = req.user ? { userId: req.user._id } : {};
    await RequestHistory.deleteMany(query);
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear history', error: error.message });
  }
});

// DELETE /api/history/:id - Delete single history entry
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    await RequestHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'History record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete history record', error: error.message });
  }
});

module.exports = router;

