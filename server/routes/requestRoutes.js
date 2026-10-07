const express = require('express');
const router = express.Router();
const SavedRequest = require('../models/SavedRequest');
const { optionalAuth } = require('../middleware/auth');

// GET /api/requests/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const request = await SavedRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch request', error: error.message });
  }
});

// POST /api/requests - Create new saved request
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      name = 'New Request',
      collectionId,
      folderId = null,
      method = 'GET',
      url = 'http://localhost:5000/api/mock/users',
      params = [],
      headers = [],
      auth = { type: 'none' },
      bodyType = 'none',
      rawBody = '',
      formData = [],
      testCases = [],
    } = req.body;

    if (!collectionId) {
      return res.status(400).json({ message: 'Collection ID is required' });
    }

    const userId = req.user ? req.user._id : null;
    const newRequest = await SavedRequest.create({
      name,
      collectionId,
      folderId,
      userId,
      method,
      url,
      params,
      headers,
      auth,
      bodyType,
      rawBody,
      formData,
      testCases,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
});

// PUT /api/requests/:id - Update saved request
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const updated = await SavedRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request', error: error.message });
  }
});

// DELETE /api/requests/:id - Delete saved request
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const deleted = await SavedRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
});

// POST /api/requests/:id/duplicate - Duplicate request
router.post('/:id/duplicate', optionalAuth, async (req, res) => {
  try {
    const original = await SavedRequest.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Original request not found' });

    const copyObj = original.toObject();
    delete copyObj._id;
    delete copyObj.createdAt;
    delete copyObj.updatedAt;
    copyObj.name = `${original.name} (Copy)`;

    const duplicated = await SavedRequest.create(copyObj);
    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to duplicate request', error: error.message });
  }
});

module.exports = router;

