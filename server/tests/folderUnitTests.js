const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Collection = require('../models/Collection');
const SavedRequest = require('../models/SavedRequest');
const User = require('../models/User');

test('Unit Tests: Distinct API Folders & Search Filtering Suite', async (t) => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_testing_tool');

  let testUser = await User.findOne();
  if (!testUser) {
    testUser = await User.create({
      name: 'Test Runner',
      email: 'test-runner@studio.dev',
      password: 'password123',
    });
  }

  let testCol;
  let folderA_Id = 'f-test-a-' + Date.now();
  let folderB_Id = 'f-test-b-' + Date.now();

  await t.test('1. Create Collection with Distinct API Folders', async () => {
    testCol = await Collection.create({
      name: 'Automated Test Suite Collection',
      description: 'Collection for testing folder operations',
      userId: testUser._id,
      folders: [
        {
          id: folderA_Id,
          name: 'GitHub API',
          tag: 'GitHub',
          color: 'purple',
          description: 'GitHub distinct endpoints',
          parentId: null,
        },
      ],
    });

    assert.ok(testCol._id, 'Collection should be created with an _id');
    assert.equal(testCol.folders.length, 1, 'Should have 1 folder initially');
    assert.equal(testCol.folders[0].name, 'GitHub API');
    assert.equal(testCol.folders[0].tag, 'GitHub');
  });

  await t.test('2. Create Second Folder (+ Folder inside Collection)', async () => {
    testCol.folders.push({
      id: folderB_Id,
      name: 'Weather API',
      tag: 'Weather',
      color: 'sky',
      description: 'Open-Meteo distinct endpoints',
      parentId: null,
    });
    await testCol.save();

    const refreshed = await Collection.findById(testCol._id);
    assert.equal(refreshed.folders.length, 2, 'Should now have 2 distinct folders');
    assert.equal(refreshed.folders[1].name, 'Weather API');
  });

  await t.test('3. Rename Folder Inline / Via Update', async () => {
    const folder = testCol.folders.find((f) => f.id === folderA_Id);
    folder.name = 'GitHub REST API v3';
    folder.tag = 'Git';
    await testCol.save();

    const refreshed = await Collection.findById(testCol._id);
    const updated = refreshed.folders.find((f) => f.id === folderA_Id);
    assert.equal(updated.name, 'GitHub REST API v3', 'Folder name should be updated');
    assert.equal(updated.tag, 'Git', 'Folder tag should be updated');
  });

  let req1, req2;
  await t.test('4. Add Requests into Distinct Folders', async () => {
    req1 = await SavedRequest.create({
      name: 'Get Octocat Profile',
      url: 'https://api.github.com/users/octocat',
      method: 'GET',
      collectionId: testCol._id,
      folderId: folderA_Id,
      userId: testUser._id,
    });

    req2 = await SavedRequest.create({
      name: 'Get Current Weather',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867',
      method: 'GET',
      collectionId: testCol._id,
      folderId: folderB_Id,
      userId: testUser._id,
    });

    assert.equal(req1.folderId, folderA_Id, 'Request 1 should belong to Folder A');
    assert.equal(req2.folderId, folderB_Id, 'Request 2 should belong to Folder B');
  });

  await t.test('5. Move Request from Folder B to Folder A (Drag & Drop / Move To)', async () => {
    await SavedRequest.findByIdAndUpdate(req2._id, { folderId: folderA_Id });
    const moved = await SavedRequest.findById(req2._id);
    assert.equal(moved.folderId, folderA_Id, 'Request 2 should now belong to Folder A');

    const folderARequests = await SavedRequest.find({ collectionId: testCol._id, folderId: folderA_Id });
    assert.equal(folderARequests.length, 2, 'Folder A should now have 2 requests');
  });

  await t.test('6. Duplicate Folder along with its Requests', async () => {
    const originalFolder = testCol.folders.find((f) => f.id === folderA_Id);
    const dupFolderId = 'f-dup-' + Date.now();
    const duplicatedFolder = {
      id: dupFolderId,
      name: `${originalFolder.name} (Copy)`,
      tag: originalFolder.tag,
      color: originalFolder.color,
      description: originalFolder.description,
      parentId: null,
    };
    testCol.folders.push(duplicatedFolder);
    await testCol.save();

    // Copy requests
    const folderRequests = await SavedRequest.find({ collectionId: testCol._id, folderId: folderA_Id });
    for (const item of folderRequests) {
      await SavedRequest.create({
        name: `${item.name} (Copy)`,
        url: item.url,
        method: item.method,
        collectionId: testCol._id,
        folderId: dupFolderId,
        userId: testUser._id,
      });
    }

    const dupRequests = await SavedRequest.find({ collectionId: testCol._id, folderId: dupFolderId });
    assert.equal(dupRequests.length, 2, 'Duplicated folder should contain duplicates of all requests');
    assert.ok(dupRequests[0].name.includes('(Copy)'), 'Duplicated request should have (Copy) in name');
  });

  await t.test('7. Delete Folder with Confirmation (Move Requests to Collection Root)', async () => {
    // Delete Folder B
    testCol.folders = testCol.folders.filter((f) => f.id !== folderB_Id);
    await testCol.save();

    // Any requests remaining in folder B get reset to root
    await SavedRequest.updateMany(
      { collectionId: testCol._id, folderId: folderB_Id },
      { $set: { folderId: null } }
    );

    const refreshed = await Collection.findById(testCol._id);
    assert.ok(!refreshed.folders.some((f) => f.id === folderB_Id), 'Folder B should be removed');
  });

  await t.test('8. Search Filtering Logic Unit Tests', async () => {
    const allRequests = [
      { name: 'Get Octocat Profile', url: 'https://api.github.com/users/octocat', method: 'GET', folderId: folderA_Id },
      { name: 'Create Post Payload', url: 'https://httpbin.org/post', method: 'POST', folderId: 'f-httpbin' },
      { name: 'Delete User Account', url: 'https://jsonplaceholder.typicode.com/users/1', method: 'DELETE', folderId: 'f-json' },
    ];

    const folders = [
      { id: folderA_Id, name: 'GitHub REST API v3', tag: 'Git' },
      { id: 'f-httpbin', name: 'Httpbin API', tag: 'Httpbin' },
      { id: 'f-json', name: 'JSONPlaceholder API', tag: 'JSON' },
    ];

    // Test Search by Folder Name "GitHub"
    const searchFolder = 'GitHub';
    const matchedByFolder = folders.filter((f) => f.name.toLowerCase().includes(searchFolder.toLowerCase()));
    assert.equal(matchedByFolder.length, 1, 'Search by folder name should match exactly 1 folder');
    assert.equal(matchedByFolder[0].id, folderA_Id);

    // Test Search by Request URL "httpbin"
    const searchUrl = 'httpbin';
    const matchedByUrl = allRequests.filter((r) => r.url.toLowerCase().includes(searchUrl.toLowerCase()));
    assert.equal(matchedByUrl.length, 1, 'Search by URL should find 1 request');
    assert.equal(matchedByUrl[0].name, 'Create Post Payload');

    // Test Method Filter Chips (POST)
    const methodFilter = 'POST';
    const matchedMethod = allRequests.filter((r) => r.method === methodFilter);
    assert.equal(matchedMethod.length, 1, 'Method filter POST should match 1 request');
    assert.equal(matchedMethod[0].method, 'POST');

    // Test Combined Search ("User") + Method (DELETE)
    const combinedQuery = 'User';
    const combinedResults = allRequests.filter(
      (r) =>
        (r.name.toLowerCase().includes(combinedQuery.toLowerCase()) || r.url.toLowerCase().includes(combinedQuery.toLowerCase())) &&
        r.method === 'DELETE'
    );
    assert.equal(combinedResults.length, 1, 'Combined search and method filter should match 1 request');
    assert.equal(combinedResults[0].name, 'Delete User Account');
  });

  // Clean up
  await SavedRequest.deleteMany({ collectionId: testCol._id });
  await Collection.findByIdAndDelete(testCol._id);
  await mongoose.disconnect();
});
