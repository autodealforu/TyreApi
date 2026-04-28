import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './api/users/UserModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const resetAdmin = async () => {
  try {
    // Check if admin user exists
    let admin = await User.findOne({ username: 'superadmin' });

    if (admin) {
      console.log('✅ Found existing admin user. Resetting password...');
      admin.password = '123456';
      await admin.save(); // .save() triggers the pre('save') hook which hashes the password
      console.log('✅ Password reset successfully!');
    } else {
      console.log('⚠️  No admin user found. Creating one...');
      admin = new User({
        name: 'Admin User',
        email: 'superadmin@superadmin.com',
        password: '123456',
        phone: '9999999999',
        username: 'superadmin',
        published_status: 'PUBLISHED',
        role: 'SUPER ADMIN',
      });
      await admin.save(); // .save() triggers the pre('save') hook which hashes the password
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n========================================');
    console.log('  Login with these credentials:');
    console.log('  Username: superadmin');
    console.log('  Password: 123456');
    console.log('========================================\n');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
