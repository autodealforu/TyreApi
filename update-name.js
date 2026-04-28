import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const result = await mongoose.connection.db.collection('users').updateOne(
  { username: 'superadmin' },
  { $set: { name: 'Super Admin' } }
);

console.log('Updated:', result.modifiedCount);

const user = await mongoose.connection.db.collection('users').findOne({ username: 'superadmin' });
console.log('Name:', user.name, '| Role:', user.role, '| Username:', user.username);

process.exit();
