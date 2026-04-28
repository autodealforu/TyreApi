import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

const resetCounters = async () => {
  try {
    await connectDB();

    console.log('🔄 Resetting mongoose sequence counters...');

    // Drop the counters collection
    const db = mongoose.connection.db;
    try {
      await db.collection('counters').drop();
      console.log('✅ Counters collection dropped successfully');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️  Counters collection does not exist');
      } else {
        console.log('⚠️  Error dropping counters:', error.message);
      }
    }

    console.log('🎉 Counter reset completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting counters:', error.message);
    process.exit(1);
  }
};

resetCounters();
