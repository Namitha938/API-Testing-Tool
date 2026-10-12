const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Collection = require('./models/Collection');
const SavedRequest = require('./models/SavedRequest');
const User = require('./models/User');

async function seedDistinctFolders() {
  console.log('--- RUNNING DISTINCT API FOLDERS MIGRATION & SEEDING ---');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_testing_tool');

  // Find or create the target collection "Production Real-World APIs"
  let targetCol = await Collection.findOne({ name: 'Production Real-World APIs' });
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) adminUser = await User.findOne();

  if (!targetCol) {
    targetCol = await Collection.create({
      name: 'Production Real-World APIs',
      description: 'Production-ready public APIs grouped into distinct service folders.',
      userId: adminUser ? adminUser._id : null,
      folders: [],
    });
  }

  // Define distinct folders
  const githubFolderId = 'folder-github-api';
  const weatherFolderId = 'folder-weather-api';
  const httpbinFolderId = 'folder-httpbin-api';
  const jsonPlaceholderFolderId = 'folder-jsonplaceholder-api';

  const distinctFolders = [
    {
      id: githubFolderId,
      name: 'GitHub API',
      tag: 'GitHub',
      color: 'purple',
      description: 'GitHub REST endpoints for user profiles and error telemetry',
      parentId: null,
    },
    {
      id: weatherFolderId,
      name: 'Weather API',
      tag: 'Weather',
      color: 'sky',
      description: 'Open-Meteo real-time global weather telemetry',
      parentId: null,
    },
    {
      id: httpbinFolderId,
      name: 'Httpbin API',
      tag: 'Httpbin',
      color: 'emerald',
      description: 'HTTP testing and payload reflection endpoints',
      parentId: null,
    },
    {
      id: jsonPlaceholderFolderId,
      name: 'JSONPlaceholder API',
      tag: 'JSON',
      color: 'indigo',
      description: 'Online fake REST API for posts, comments, and resources',
      parentId: null,
    },
  ];

  targetCol.folders = distinctFolders;
  await targetCol.save();
  console.log(`✓ Configured 4 distinct API folders in collection "${targetCol.name}":`);
  distinctFolders.forEach((f) => console.log(`   - 📁 [${f.tag}] ${f.name} (${f.color})`));

  // Now assign the 5 distinct requests into their respective folders
  const requests = await SavedRequest.find({ collectionId: targetCol._id });
  console.log(`Found ${requests.length} requests in collection.`);

  for (const req of requests) {
    const nameLower = req.name.toLowerCase();
    const urlLower = req.url.toLowerCase();

    if (nameLower.includes('github') || urlLower.includes('github')) {
      req.folderId = githubFolderId;
      console.log(`   → Assigned "${req.name}" to GitHub API folder`);
    } else if (nameLower.includes('weather') || urlLower.includes('weather') || urlLower.includes('open-meteo')) {
      req.folderId = weatherFolderId;
      console.log(`   → Assigned "${req.name}" to Weather API folder`);
    } else if (nameLower.includes('httpbin') || urlLower.includes('httpbin')) {
      req.folderId = httpbinFolderId;
      console.log(`   → Assigned "${req.name}" to Httpbin API folder`);
    } else if (nameLower.includes('posts') || urlLower.includes('jsonplaceholder')) {
      req.folderId = jsonPlaceholderFolderId;
      console.log(`   → Assigned "${req.name}" to JSONPlaceholder API folder`);
    }
    await req.save();
  }

  console.log('✓ Migration and seeding completed successfully!');
  await mongoose.disconnect();
}

seedDistinctFolders().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
