import mongoose from 'mongoose';
import config from './config/config.js';
import Admin from './models/adminModel.js';
import authService from './services/authService.js';

async function seedAdmin() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: 'admin@h2s.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await authService.hashPassword('admin123');
    await Admin.create({
      username: 'admin',
      email: 'admin@h2s.com',
      password: hashedPassword,
      role: 'superadmin'
    });

    console.log('Admin seeded successfully: admin@h2s.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedAdmin();
