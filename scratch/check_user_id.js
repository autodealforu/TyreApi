import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/users/UserModel.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ name: /Shashwat/i });
    console.log('Users matching Shashwat:');
    users.forEach(u => {
        console.log(`- Name: ${u.name}, ID: ${u._id}, Role: ${u.role}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUser();
