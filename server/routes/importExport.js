const express = require('express');
const Request = require('../models/Request');
const Collection = require('../models/Collection');
const Environment = require('../models/Environment');
const TestCase = require('../models/TestCase');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Export collection
router.get('/export/collection/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('requests');
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const exportData = {
      type: 'collection',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username,
      collection: {
        name: collection.name,
        description: collection.description,
        folders: collection.folders,
        requests: collection.requests.map(r => ({
          name: r.name,
          method: r.method,
          url: r.url,
          headers: r.headers,
          params: r.params,
          body: r.body,
          bodyType: r.bodyType,
          auth: r.auth,
          description: r.description
        }))
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${collection.name.replace(/[^a-z0-9]/gi, '_')}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export collection error:', error);
    res.status(500).json({ error: 'Failed to export collection' });
  }
});

// Export environment
router.get('/export/environment/:id', authenticate, async (req, res) => {
  try {
    const env = await Environment.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { isGlobal: true }]
    });
    
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    const exportData = {
      type: 'environment',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username,
      environment: {
        name: env.name,
        description: env.description,
        variables: env.variables
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${env.name.replace(/[^a-z0-9]/gi, '_')}_env.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export environment error:', error);
    res.status(500).json({ error: 'Failed to export environment' });
  }
});

// Export all user data
router.get('/export/all', authenticate, async (req, res) => {
  try {
    const [collections, environments, requests, testCases] = await Promise.all([
      Collection.find({ user: req.user._id }).populate('requests'),
      Environment.find({ user: req.user._id }),
      Request.find({ user: req.user._id }),
      TestCase.find({ user: req.user._id })
    ]);
    
    const exportData = {
      type: 'full-export',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username,
      collections: collections.map(c => ({
        name: c.name,
        description: c.description,
        folders: c.folders,
        requests: c.requests.map(r => ({
          name: r.name,
          method: r.method,
          url: r.url,
          headers: r.headers,
          params: r.params,
          body: r.body,
          bodyType: r.bodyType,
          auth: r.auth,
          description: r.description
        }))
      })),
      environments: environments.map(e => ({
        name: e.name,
        description: e.description,
        variables: e.variables
      })),
      requests: requests.map(r => ({
        name: r.name,
        method: r.method,
        url: r.url,
        headers: r.headers,
        params: r.params,
        body: r.body,
        bodyType: r.bodyType,
        auth: r.auth,
        description: r.description
      })),
      testCases: testCases.map(t => ({
        name: t.name,
        description: t.description,
        request: t.request,
        assertions: t.assertions,
        setupScript: t.setupScript,
        teardownScript: t.teardownScript
      }))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="api-testing-tool-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export all error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import collection
router.post('/import/collection', authenticate, async (req, res) => {
  try {
    const { collection, overwrite } = req.body;
    
    if (!collection || !collection.name) {
      return res.status(400).json({ error: 'Invalid collection data' });
    }
    
    let existingCollection = await Collection.findOne({
      name: collection.name,
      user: req.user._id
    });
    
    if (existingCollection) {
      if (!overwrite) {
        return res.status(400).json({ error: 'Collection with this name already exists. Use overwrite option.' });
      }
      // Delete existing requests
      await Request.deleteMany({ collection: existingCollection._id });
      existingCollection.folders = collection.folders || [];
      existingCollection.description = collection.description;
      await existingCollection.save();
    } else {
      existingCollection = new Collection({
        name: collection.name,
        description: collection.description,
        folders: collection.folders || [],
        user: req.user._id
      });
      await existingCollection.save();
    }
    
    // Import requests
    const requests = [];
    for (const reqData of collection.requests || []) {
      const request = new Request({
        ...reqData,
        user: req.user._id,
        collection: existingCollection._id
      });
      await request.save();
      requests.push(request._id);
    }
    
    existingCollection.requests = requests;
    await existingCollection.save();
    
    res.json({ message: 'Collection imported successfully', collection: existingCollection });
  } catch (error) {
    console.error('Import collection error:', error);
    res.status(500).json({ error: 'Failed to import collection' });
  }
});

// Import environment
router.post('/import/environment', authenticate, async (req, res) => {
  try {
    const { environment, overwrite } = req.body;
    
    if (!environment || !environment.name) {
      return res.status(400).json({ error: 'Invalid environment data' });
    }
    
    let existingEnv = await Environment.findOne({
      name: environment.name,
      user: req.user._id
    });
    
    if (existingEnv) {
      if (!overwrite) {
        return res.status(400).json({ error: 'Environment with this name already exists. Use overwrite option.' });
      }
      existingEnv.variables = environment.variables || [];
      existingEnv.description = environment.description;
      await existingEnv.save();
    } else {
      existingEnv = new Environment({
        name: environment.name,
        description: environment.description,
        variables: environment.variables || [],
        user: req.user._id
      });
      await existingEnv.save();
    }
    
    res.json({ message: 'Environment imported successfully', environment: existingEnv });
  } catch (error) {
    console.error('Import environment error:', error);
    res.status(500).json({ error: 'Failed to import environment' });
  }
});

// Import full export
router.post('/import/all', authenticate, async (req, res) => {
  try {
    const { collections, environments, requests, testCases, overwrite } = req.body;
    
    const results = { collections: 0, environments: 0, requests: 0, testCases: 0 };
    
    // Import environments
    if (environments) {
      for (const envData of environments) {
        let env = await Environment.findOne({ name: envData.name, user: req.user._id });
        if (env) {
          if (overwrite) {
            env.variables = envData.variables || [];
            env.description = envData.description;
            await env.save();
            results.environments++;
          }
        } else {
          env = new Environment({
            name: envData.name,
            description: envData.description,
            variables: envData.variables || [],
            user: req.user._id
          });
          await env.save();
          results.environments++;
        }
      }
    }
    
    // Import collections
    if (collections) {
      for (const collData of collections) {
        let collection = await Collection.findOne({ name: collData.name, user: req.user._id });
        if (collection) {
          if (overwrite) {
            await Request.deleteMany({ collection: collection._id });
            collection.folders = collData.folders || [];
            collection.description = collData.description;
            await collection.save();
          }
        } else {
          collection = new Collection({
            name: collData.name,
            description: collData.description,
            folders: collData.folders || [],
            user: req.user._id
          });
          await collection.save();
        }
        
        // Import requests
        for (const reqData of collData.requests || []) {
          const request = new Request({
            ...reqData,
            user: req.user._id,
            collection: collection._id
          });
          await request.save();
          collection.requests.push(request._id);
          results.requests++;
        }
        await collection.save();
        results.collections++;
      }
    }
    
    // Import standalone requests
    if (requests) {
      for (const reqData of requests) {
        const request = new Request({
          ...reqData,
          user: req.user._id
        });
        await request.save();
        results.requests++;
      }
    }
    
    // Import test cases
    if (testCases) {
      for (const tcData of testCases) {
        const testCase = new TestCase({
          ...tcData,
          user: req.user._id
        });
        await testCase.save();
        results.testCases++;
      }
    }
    
    res.json({ message: 'Import completed', results });
  } catch (error) {
    console.error('Import all error:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;