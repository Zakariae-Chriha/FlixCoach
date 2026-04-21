require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI, { family: 4 }).then(async () => {
  console.log('Connected to MongoDB...');

  // Drop all collections
  const collections = await mongoose.connection.db.collections();
  for (const col of collections) {
    await col.deleteMany({});
    console.log(`✅ Cleared: ${col.collectionName}`);
  }

  // Create fresh admin account (model pre-save hook hashes the password)
  const User = require('./models/User');
  await User.create({
    name: 'Admin',
    email: 'chrihazakaria@gmail.com',
    password: 'admin123',
    role: 'admin',
    onboardingCompleted: true,
  });

  console.log('\n🎉 Database reset complete!');
  console.log('─────────────────────────────');
  console.log('Admin login:');
  console.log('  Email:    chrihazakaria@gmail.com');
  console.log('  Password: admin123');
  console.log('─────────────────────────────');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
