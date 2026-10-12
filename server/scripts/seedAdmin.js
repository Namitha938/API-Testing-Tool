const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!adminEmail || !adminEmail.includes('@')) {
    console.error('❌ Error: ADMIN_EMAIL environment variable is missing or invalid.');
    console.error('Please define ADMIN_EMAIL in your server/.env file.');
    process.exit(1);
  }

  if (!adminPassword || adminPassword.length < 12) {
    console.error('❌ Error: ADMIN_PASSWORD must be at least 12 characters long for security compliance.');
    console.error('Please define a strong ADMIN_PASSWORD in your server/.env file.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_testing_tool';

  try {
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✓ Database connected successfully.');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.role = 'admin';
      admin.status = 'active';
      admin.password = hashedPassword;
      admin.loginFailedAttempts = 0;
      admin.loginLockUntil = null;
      await admin.save();
      console.log(`✓ Updated existing account [${adminEmail}] with 'admin' role and encrypted password.`);
    } else {
      admin = await User.create({
        name: adminEmail.split('@')[0],
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });
      console.log(`✓ Created new administrator account: [${adminEmail}] with 'admin' role.`);
    }

    console.log('\n======================================================');
    console.log('🎉 Administrator account seeded successfully!');
    console.log(`👤 Admin Email: ${adminEmail}`);
    console.log(`🔒 Role: ${admin.role}`);
    console.log(`⚡ Password: [PROTECTED - Hashed with bcrypt]`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
}

seedAdmin();

