const express = require('express');
const Environment = require('../models/Environment');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all environments for user
router.get('/', authenticate, async (req, res) => {
  try {
    const environments = await Environment.find({ 
      $or: [{ user: req.user._id }, { isGlobal: true }] 
    }).sort({ isGlobal: -1, name: 1 });
    res.json(environments);
  } catch (error) {
    console.error('Get environments error:', error);
    res.status(500).json({ error: 'Failed to fetch environments' });
  }
});

// Get single environment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const env = await Environment.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { isGlobal: true }]
    });
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    res.json(env);
  } catch (error) {
    console.error('Get environment error:', error);
    res.status(500).json({ error: 'Failed to fetch environment' });
  }
});

// Create environment
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, variables, isGlobal } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const env = new Environment({
      name,
      description,
      variables: variables || [],
      user: req.user._id,
      isGlobal: req.user.role === 'admin' ? isGlobal : false
    });
    
    await env.save();
    res.status(201).json(env);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Environment with this name already exists' });
    }
    console.error('Create environment error:', error);
    res.status(500).json({ error: 'Failed to create environment' });
  }
});

// Update environment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, variables, isGlobal } = req.body;
    
    const env = await Environment.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    if (name) env.name = name;
    if (description !== undefined) env.description = description;
    if (variables) env.variables = variables;
    if (req.user.role === 'admin' && isGlobal !== undefined) env.isGlobal = isGlobal;
    
    await env.save();
    res.json(env);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Environment with this name already exists' });
    }
    console.error('Update environment error:', error);
    res.status(500).json({ error: 'Failed to update environment' });
  }
});

// Delete environment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const env = await Environment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    res.json({ message: 'Environment deleted' });
  } catch (error) {
    console.error('Delete environment error:', error);
    res.status(500).json({ error: 'Failed to delete environment' });
  }
});

module.exports = router;