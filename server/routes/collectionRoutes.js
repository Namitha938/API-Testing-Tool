const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const SavedRequest = require('../models/SavedRequest');
const { optionalAuth } = require('../middleware/auth');

// GET /api/collections - List all collections for current user
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query = req.user ? { $or: [{ userId: req.user._id }, { isPublic: true }] } : {};
    const collections = await Collection.find(query).sort({ updatedAt: -1 });

    // Fetch saved requests count or requests for each collection
    const result = await Promise.all(
      collections.map(async (col) => {
        const requests = await SavedRequest.find({ collectionId: col._id }).sort({ createdAt: 1 });
        return {
          ...col.toObject(),
          requests,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch collections', error: error.message });
  }
});

// POST /api/collections - Create collection
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, description = '', isPublic = false, folders = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Collection name is required.' });
    }

    const userId = req.user ? req.user._id : null;
    const collection = await Collection.create({
      name,
      description,
      isPublic,
      userId,
      folders,
    });

    res.status(201).json({
      ...collection.toObject(),
      requests: [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create collection', error: error.message });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { name, description, isPublic, folders } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (isPublic !== undefined) update.isPublic = isPublic;
    if (folders !== undefined) update.folders = folders;

    const collection = await Collection.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const requests = await SavedRequest.find({ collectionId: collection._id });
    res.json({ ...collection.toObject(), requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update collection', error: error.message });
  }
});

// DELETE /api/collections/:id - Delete collection and its requests
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await SavedRequest.deleteMany({ collectionId: req.params.id });
    res.json({ message: 'Collection and associated requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete collection', error: error.message });
  }
});

// POST /api/collections/:id/folders - Add folder to collection
router.post('/:id/folders', optionalAuth, async (req, res) => {
  try {
    const { name, description = '', parentId = null } = req.body;
    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const newFolder = {
      id: 'f-' + Date.now(),
      name,
      description,
      parentId: parentId || null,
    };

    collection.folders.push(newFolder);
    await collection.save();

    const requests = await SavedRequest.find({ collectionId: collection._id });
    res.json({ ...collection.toObject(), requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add folder', error: error.message });
  }
});

// DELETE /api/collections/:id/folders/:folderId - Delete folder
router.delete('/:id/folders/:folderId', optionalAuth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    collection.folders = collection.folders.filter(f => f.id !== req.params.folderId);
    await collection.save();

    // Reset folderId on requests in this folder
    await SavedRequest.updateMany(
      { collectionId: collection._id, folderId: req.params.folderId },
      { $set: { folderId: null } }
    );

    const requests = await SavedRequest.find({ collectionId: collection._id });
    res.json({ ...collection.toObject(), requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete folder', error: error.message });
  }
});

// GET /api/collections/:id/export - Export collection (native JSON & Postman format)
router.get('/:id/export', optionalAuth, async (req, res) => {
  try {
    const format = req.query.format || 'postman'; // 'postman' or 'native'
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const requests = await SavedRequest.find({ collectionId: collection._id });

    if (format === 'native') {
      return res.json({
        exportType: 'api-testing-tool-collection',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        collection: collection.toObject(),
        requests,
      });
    }

    // Export Postman v2.1 compatible format
    const postmanItems = [];

    // Map folders
    const folderMap = {};
    collection.folders.forEach(f => {
      folderMap[f.id] = {
        name: f.name,
        description: f.description,
        item: [],
      };
    });

    requests.forEach(r => {
      const item = {
        name: r.name,
        request: {
          method: r.method,
          url: {
            raw: r.url,
            query: (r.params || []).map(p => ({ key: p.key, value: p.value, disabled: !p.enabled })),
          },
          header: (r.headers || []).map(h => ({ key: h.key, value: h.value, disabled: !h.enabled })),
          body: {
            mode: r.bodyType === 'json' ? 'raw' : r.bodyType === 'form-data' ? 'formdata' : 'raw',
            raw: r.rawBody || '',
            options: r.bodyType === 'json' ? { raw: { language: 'json' } } : {},
          },
        },
      };

      if (r.folderId && folderMap[r.folderId]) {
        folderMap[r.folderId].item.push(item);
      } else {
        postmanItems.push(item);
      }
    });

    // Add folder items
    Object.values(folderMap).forEach(fItem => {
      postmanItems.push(fItem);
    });

    const postmanCollection = {
      info: {
        _postman_id: collection._id.toString(),
        name: collection.name,
        description: collection.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: postmanItems,
    };

    res.json(postmanCollection);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export collection', error: error.message });
  }
});

// POST /api/collections/import - Import collection (supports Postman and native)
router.post('/import', optionalAuth, async (req, res) => {
  try {
    const importData = req.body;
    if (!importData) {
      return res.status(400).json({ message: 'No import data provided.' });
    }

    const userId = req.user ? req.user._id : null;

    // Check if Native API Testing Tool format
    if (importData.exportType === 'api-testing-tool-collection') {
      const colData = importData.collection;
      const createdCol = await Collection.create({
        name: colData.name + ' (Imported)',
        description: colData.description || '',
        userId,
        folders: colData.folders || [],
      });

      const reqDocs = (importData.requests || []).map(r => ({
        name: r.name,
        collectionId: createdCol._id,
        folderId: r.folderId || null,
        userId,
        method: r.method || 'GET',
        url: r.url,
        params: r.params || [],
        headers: r.headers || [],
        auth: r.auth || { type: 'none' },
        bodyType: r.bodyType || 'none',
        rawBody: r.rawBody || '',
        formData: r.formData || [],
        testCases: r.testCases || [],
      }));

      const createdRequests = await SavedRequest.insertMany(reqDocs);
      return res.status(201).json({
        ...createdCol.toObject(),
        requests: createdRequests,
        message: `Imported native collection with ${createdRequests.length} requests!`,
      });
    }

    // 2. Check if Postman v2 or v2.1 Collection
    if (importData.info && (importData.info.name || importData.info.schema)) {
      const colName = importData.info.name || 'Imported Postman Collection';
      const colDesc = typeof importData.info.description === 'string' ? importData.info.description : '';

      const folders = [];
      const requestsToCreate = [];

      // Recursive parser for Postman items (preserves nested folder parentId)
      function parseItems(items, folderId = null) {
        if (!Array.isArray(items)) return;

        items.forEach(item => {
          if (item.item && Array.isArray(item.item)) {
            // It's a folder
            const newFId = 'f-' + Math.random().toString(36).substring(2, 9);
            folders.push({
              id: newFId,
              name: item.name || 'Folder',
              description: typeof item.description === 'string' ? item.description : '',
              parentId: folderId,
            });
            parseItems(item.item, newFId);
          } else if (item.request) {
            // It's a request
            const reqObj = item.request;
            const method = (reqObj.method || 'GET').toUpperCase();
            let url = '';
            if (typeof reqObj.url === 'string') {
              url = reqObj.url;
            } else if (reqObj.url && reqObj.url.raw) {
              url = reqObj.url.raw;
            }

            const headers = Array.isArray(reqObj.header)
              ? reqObj.header.map(h => ({ key: h.key, value: h.value, enabled: !h.disabled }))
              : [];

            const params = reqObj.url && Array.isArray(reqObj.url.query)
              ? reqObj.url.query.map(q => ({ key: q.key, value: q.value, enabled: !q.disabled }))
              : [];

            let bodyType = 'none';
            let rawBody = '';
            if (reqObj.body) {
              if (reqObj.body.mode === 'raw') {
                bodyType = 'json';
                rawBody = reqObj.body.raw || '';
              } else if (reqObj.body.mode === 'urlencoded') {
                bodyType = 'x-www-form-urlencoded';
              } else if (reqObj.body.mode === 'formdata') {
                bodyType = 'form-data';
              }
            }

            requestsToCreate.push({
              name: item.name || 'Untitled Request',
              folderId,
              method,
              url: url || 'http://localhost:5000/api/mock/users',
              headers,
              params,
              bodyType,
              rawBody,
              auth: { type: 'none' },
              testCases: [{ name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true }],
            });
          }
        });
      }

      parseItems(importData.item);

      const createdCol = await Collection.create({
        name: colName + ' (Imported)',
        description: colDesc,
        userId,
        folders,
      });

      const docs = requestsToCreate.map(r => ({
        ...r,
        collectionId: createdCol._id,
        userId,
      }));

      const createdRequests = await SavedRequest.insertMany(docs);
      return res.status(201).json({
        ...createdCol.toObject(),
        requests: createdRequests,
        message: `Successfully imported Postman Collection with ${createdRequests.length} requests and ${folders.length} folders!`,
      });
    }

    // 3. Check if OpenAPI 3.x or Swagger 2.0 Specification
    if (importData.openapi || importData.swagger || importData.paths) {
      const title = importData.info?.title || 'OpenAPI Specification';
      const description = typeof importData.info?.description === 'string' ? importData.info.description : '';
      const baseUrl =
        importData.servers?.[0]?.url ||
        (importData.schemes && importData.host
          ? `${importData.schemes[0]}://${importData.host}${importData.basePath || ''}`
          : 'http://localhost:5000');

      const folders = [];
      const tagFolderMap = {};
      const requestsToCreate = [];

      // Extract tags as folders
      if (Array.isArray(importData.tags)) {
        importData.tags.forEach(t => {
          const fId = 'f-' + Math.random().toString(36).substring(2, 9);
          tagFolderMap[t.name] = fId;
          folders.push({
            id: fId,
            name: t.name,
            description: t.description || '',
            parentId: null,
          });
        });
      }

      const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
      const paths = importData.paths || {};

      Object.entries(paths).forEach(([pathKey, pathItem]) => {
        if (!pathItem || typeof pathItem !== 'object') return;

        httpMethods.forEach(method => {
          const op = pathItem[method];
          if (!op) return;

          let folderId = null;
          if (op.tags && op.tags.length > 0) {
            const tagName = op.tags[0];
            if (!tagFolderMap[tagName]) {
              const newFId = 'f-' + Math.random().toString(36).substring(2, 9);
              tagFolderMap[tagName] = newFId;
              folders.push({ id: newFId, name: tagName, description: '', parentId: null });
            }
            folderId = tagFolderMap[tagName];
          }

          const reqName = op.summary || op.operationId || `${method.toUpperCase()} ${pathKey}`;
          const fullUrl = baseUrl.replace(/\/$/, '') + (pathKey.startsWith('/') ? pathKey : '/' + pathKey);

          const params = [];
          const headers = [];

          if (Array.isArray(op.parameters)) {
            op.parameters.forEach(p => {
              if (p.in === 'query') {
                params.push({ key: p.name, value: p.example || p.default || '', enabled: !!p.required });
              } else if (p.in === 'header') {
                headers.push({ key: p.name, value: p.example || p.default || '', enabled: !!p.required });
              }
            });
          }

          let bodyType = 'none';
          let rawBody = '';
          if (op.requestBody && op.requestBody.content) {
            if (op.requestBody.content['application/json']) {
              bodyType = 'json';
              const example = op.requestBody.content['application/json'].example;
              rawBody = example ? JSON.stringify(example, null, 2) : '{\n  \n}';
            } else if (op.requestBody.content['application/xml']) {
              bodyType = 'xml';
              rawBody = '<request></request>';
            } else if (op.requestBody.content['multipart/form-data']) {
              bodyType = 'form-data';
            } else if (op.requestBody.content['application/x-www-form-urlencoded']) {
              bodyType = 'x-www-form-urlencoded';
            }
          }

          requestsToCreate.push({
            name: reqName,
            folderId,
            method: method.toUpperCase(),
            url: fullUrl,
            params,
            headers,
            bodyType,
            rawBody,
            auth: { type: 'none' },
            testCases: [{ name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true }],
          });
        });
      });

      const createdCol = await Collection.create({
        name: title + ' (OpenAPI)',
        description,
        userId,
        folders,
      });

      const docs = requestsToCreate.map(r => ({
        ...r,
        collectionId: createdCol._id,
        userId,
      }));

      const createdRequests = await SavedRequest.insertMany(docs);
      return res.status(201).json({
        ...createdCol.toObject(),
        requests: createdRequests,
        message: `Successfully imported OpenAPI/Swagger spec with ${createdRequests.length} endpoints and ${folders.length} folders!`,
      });
    }

    // 4. Check if cURL Command format
    const curlInput = typeof importData === 'string' ? importData : importData.curl || importData.rawCurl;
    if (curlInput && typeof curlInput === 'string' && curlInput.toLowerCase().includes('curl')) {
      let str = curlInput.trim();
      if (str.startsWith('curl ')) str = str.slice(5).trim();

      let method = 'GET';
      let url = '';
      const headers = [];
      let rawBody = '';
      let bodyType = 'none';

      const methodMatch = str.match(/(?:-X|--request)\s+([A-Z]+)/i);
      if (methodMatch) method = methodMatch[1].toUpperCase();

      const urlMatch = str.match(/(?:'|")?(https?:\/\/[^\s'"]+)(?:'|")?/i);
      if (urlMatch) url = urlMatch[1];

      const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
      let hMatch;
      while ((hMatch = headerRegex.exec(str)) !== null) {
        const headerStr = hMatch[1];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > -1) {
          headers.push({
            key: headerStr.slice(0, colonIdx).trim(),
            value: headerStr.slice(colonIdx + 1).trim(),
            enabled: true,
          });
        }
      }

      const dataRegex = /(?:-d|--data|--data-raw|--data-binary)\s+(['"])([\s\S]*?)\1/i;
      const dataMatch = str.match(dataRegex);
      if (dataMatch) {
        rawBody = dataMatch[2];
        bodyType = 'raw';
        if (!methodMatch) method = 'POST';
        try {
          JSON.parse(rawBody);
          bodyType = 'json';
        } catch (_) {
          if (rawBody.trim().startsWith('<')) bodyType = 'xml';
        }
      }

      const createdCol = await Collection.create({
        name: 'cURL Imported (' + (url ? new URL(url).hostname : 'Request') + ')',
        description: 'Imported from raw cURL command',
        userId,
        folders: [],
      });

      const doc = await SavedRequest.create({
        name: `${method} ${url ? new URL(url).pathname : 'Endpoint'}`,
        collectionId: createdCol._id,
        folderId: null,
        userId,
        method,
        url: url || 'http://localhost:5000/api/mock/users',
        headers,
        params: [],
        bodyType,
        rawBody,
        auth: { type: 'none' },
        testCases: [{ name: 'Status code is 200', type: 'status', expectedValue: '200', enabled: true }],
      });

      return res.status(201).json({
        ...createdCol.toObject(),
        requests: [doc],
        message: 'Successfully imported cURL command as API request!',
      });
    }

    res.status(400).json({
      message: 'Unrecognized format. Please provide a valid Postman Collection (v2.1), OpenAPI/Swagger (JSON), or cURL command.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Collection import failed', error: error.message });
  }
});

module.exports = router;

