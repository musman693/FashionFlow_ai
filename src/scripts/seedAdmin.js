const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const User = require('../models/User');
const { env } = require('../config/env');

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  await connectDatabase();

  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const admin = new User({
    name: 'Admin User',
    email: env.ADMIN_EMAIL,
    password: hashed,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin user seeded successfully.');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin user', error);
  process.exit(1);
});
