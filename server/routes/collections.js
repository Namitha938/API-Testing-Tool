const express = require('express');
const Collection = require('../models/Collection');
const Request = require('../models/Request');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all collections for user
router.get('/', authenticate, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .populate('requests', 'name method url')
      .sort({ updatedAt: -1 });
    res.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get single collection with full details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate({
      path: 'requests',
      populate: {
        path: 'folder',
        select: 'name'
      }
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Create collection
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const collection = new Collection({
      name,
      description,
      user: req.user._id,
      isPublic: isPublic || false
    });
    
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Collection with this name already exists' });
    }
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Update collection
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;
    
    await collection.save();
    res.json(collection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Collection with this name already exists' });
    }
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Also delete associated requests
    await Request.deleteMany({ collection: req.params.id });
    
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Add folder to collection
router.post('/:id/folders', authenticate, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const folder = {
      name,
      parentId: parentId || null,
      collectionId: req.params.id,
      order: collection.folders.length
    };
    
    collection.folders.push(folder);
    await collection.save();
    
    const newFolder = collection.folders[collection.folders.length - 1];
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update folder
router.put('/:id/folders/:folderId', authenticate, async (req, res) => {
  try {
    const { name, parentId, order } = req.body;
    
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const folder = collection.folders.id(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    if (name) folder.name = name;
    if (parentId !== undefined) folder.parentId = parentId;
    if (order !== undefined) folder.order = order;
    
    await collection.save();
    res.json(folder);
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete folder
router.delete('/:id/folders/:folderId', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const folder = collection.folders.id(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Also update requests in this folder
    await Request.updateMany(
      { folder: req.params.folderId },
      { $set: { folder: null } }
    );
    
    folder.deleteOne();
    await collection.save();
    
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

module.exports = router;