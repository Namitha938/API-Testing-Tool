const express = require('express');
const Request = require('../models/Request');
const History = require('../models/History');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper function to substitute variables
function substituteVariables(str, variables) {
  if (!str || !variables) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const variable = variables.find(v => v.enabled && v.key === key);
    return variable ? variable.value : match;
  });
}

// Get all requests for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { collection, folder, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };
    
    if (collection) query.collection = collection;
    if (folder) query.folder = folder;
    
    const requests = await Request.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Request.countDocuments(query);
    
    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get single request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { isPublic: true }]
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Create new request
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      name, method, url, headers, params, body, bodyType, auth, 
      description, collection, folder, isPublic 
    } = req.body;
    
    if (!name || !method || !url) {
      return res.status(400).json({ error: 'Name, method, and URL are required' });
    }
    
    const request = new Request({
      name,
      method,
      url,
      headers: headers || [],
      params: params || [],
      body: body || '',
      bodyType: bodyType || 'json',
      auth: auth || { type: 'none' },
      description,
      collection,
      folder,
      user: req.user._id,
      isPublic: isPublic || false
    });
    
    const saved = await request.save();
    
    // Add to collection if specified
    if (collection) {
      await Collection.findByIdAndUpdate(collection, {
        $push: { requests: saved._id }
      });
    }
    
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update request
router.put('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const { 
      name, method, url, headers, params, body, bodyType, auth, 
      description, collection, folder, isPublic 
    } = req.body;
    
    if (name) request.name = name;
    if (method) request.method = method;
    if (url) request.url = url;
    if (headers) request.headers = headers;
    if (params) request.params = params;
    if (body !== undefined) request.body = body;
    if (bodyType) request.bodyType = bodyType;
    if (auth) request.auth = auth;
    if (description !== undefined) request.description = description;
    if (collection !== undefined) request.collection = collection;
    if (folder !== undefined) request.folder = folder;
    if (isPublic !== undefined) request.isPublic = isPublic;
    
    const updated = await request.save();
    res.json(updated);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Delete request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Remove from collection
    if (request.collection) {
      await Collection.findByIdAndUpdate(request.collection, {
        $pull: { requests: request._id }
      });
    }
    
    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Send request
router.post('/send', authenticate, async (req, res) => {
  try {
    const { 
      method, url, headers, params, body, bodyType, auth, 
      environment, collection, requestId 
    } = req.body;
    
    // Get environment variables if specified
    let envVariables = [];
    if (environment) {
      const env = await Environment.findOne({
        _id: environment,
        $or: [{ user: req.user._id }, { isGlobal: true }]
      });
      if (env) envVariables = env.variables;
    }
    
    // Build full URL with query params
    const urlObj = new URL(substituteVariables(url, envVariables));
    
    // Add params
    const allParams = (params || []).filter(p => p.enabled && p.key);
    allParams.forEach(p => {
      urlObj.searchParams.append(
        substituteVariables(p.key, envVariables),
        substituteVariables(p.value, envVariables)
      );
    });
    
    const finalUrl = urlObj.toString();
    
    // Build headers object
    const config = {
      method: (method || 'GET').toLowerCase(),
      url: finalUrl,
      headers: {},
      timeout: 60000,
      validateStatus: () => true,
    };
    
    // Add headers
    const allHeaders = (headers || []).filter(h => h.enabled && h.key);
    allHeaders.forEach(h => {
      config.headers[substituteVariables(h.key, envVariables)] = substituteVariables(h.value, envVariables);
    });
    
    // Handle authentication
    if (auth) {
      if (auth.type === 'bearer' && auth.token) {
        config.headers.Authorization = `Bearer ${substituteVariables(auth.token, envVariables)}`;
      } else if (auth.type === 'basic' && auth.username) {
        const encoded = Buffer.from(
          `${substituteVariables(auth.username, envVariables)}:${substituteVariables(auth.password || '', envVariables)}`
        ).toString('base64');
        config.headers.Authorization = `Basic ${encoded}`;
      } else if (auth.type === 'apikey' && auth.apiKey) {
        const keyName = substituteVariables(auth.apiKeyName, envVariables);
        const keyValue = substituteVariables(auth.apiKey, envVariables);
        if (auth.apiKeyIn === 'query') {
          urlObj.searchParams.append(keyName, keyValue);
          config.url = urlObj.toString();
        } else {
          config.headers[keyName] = keyValue;
        }
      }
    }
    
    // Add body for non-GET/HEAD methods
    if (body && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      let processedBody = substituteVariables(body, envVariables);
      
      if (bodyType === 'json') {
        try {
          config.data = JSON.parse(processedBody);
          config.headers['Content-Type'] = 'application/json';
        } catch (e) {
          config.data = processedBody;
        }
      } else if (bodyType === 'form') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.data = new URLSearchParams(processedBody);
      } else if (bodyType === 'xml') {
        config.headers['Content-Type'] = 'application/xml';
        config.data = processedBody;
      } else {
        config.data = processedBody;
      }
    }
    
    const start = Date.now();
    let response;
    let error = null;
    
    try {
      response = await axios(config);
    } catch (err) {
      error = err;
      if (err.response) {
        response = err.response;
      }
    }
    
    const elapsed = Date.now() - start;
    
    const responseData = {
      status: response?.status || 0,
      statusText: response?.statusText || error?.message || 'Error',
      headers: response?.headers || {},
      data: response?.data,
      time: elapsed,
      config: { url: finalUrl, method: config.method.toUpperCase() },
      error: error?.message
    };
    
    // Save to history
    const history = new History({
      user: req.user._id,
      request: {
        name: requestId ? undefined : 'Manual Request',
        method: config.method.toUpperCase(),
        url: finalUrl,
        headers: Object.entries(config.headers).map(([key, value]) => ({ key, value })),
        params: allParams,
        body,
        bodyType,
        auth
      },
      response: {
        status: responseData.status,
        statusText: responseData.statusText,
        headers: responseData.headers,
        data: responseData.data,
        time: responseData.time,
        size: JSON.stringify(responseData.data || '').length
      },
      environment,
      collection
    });
    
    await history.save();
    
    res.json(responseData);
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ error: error.message || 'Request failed' });
  }
});

// Duplicate request
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { isPublic: true }]
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const newRequest = new Request({
      ...request.toObject(),
      _id: undefined,
      name: `${request.name} (Copy)`,
      user: req.user._id,
      createdAt: undefined,
      updatedAt: undefined
    });
    
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Duplicate request error:', error);
    res.status(500).json({ error: 'Failed to duplicate request' });
  }
});

module.exports = router;