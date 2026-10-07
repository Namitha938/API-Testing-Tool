const express = require('express');
const router = express.Router();
const Environment = require('../models/Environment');
const { optionalAuth } = require('../middleware/auth');

// GET /api/environments
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query = req.user ? { $or: [{ userId: req.user._id }, { isGlobal: true }] } : {};
    const environments = await Environment.find(query).sort({ isGlobal: -1, updatedAt: -1 });
    res.json(environments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch environments', error: error.message });
  }
});

// POST /api/environments
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, isGlobal = false, variables = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Environment name is required' });

    const userId = req.user ? req.user._id : null;
    const environment = await Environment.create({
      name,
      userId,
      isGlobal,
      variables,
    });

    res.status(201).json(environment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create environment', error: error.message });
  }
});

// PUT /api/environments/:id
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { name, isGlobal, variables } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (isGlobal !== undefined) update.isGlobal = isGlobal;
    if (variables !== undefined) update.variables = variables;

    const updated = await Environment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Environment not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update environment', error: error.message });
  }
});

// DELETE /api/environments/:id
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const deleted = await Environment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Environment not found' });
    res.json({ message: 'Environment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete environment', error: error.message });
  }
});

module.exports = router;

