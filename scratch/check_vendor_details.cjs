const mongoose = require('mongoose');

async function checkVendor() {
  await mongoose.connect('mongodb://localhost:27017/multivendor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const vendor = await mongoose.connection.db.collection('users').findOne({ role: 'VENDOR' });
  console.log('Vendor User Details:', JSON.stringify(vendor, null, 2));

  await mongoose.disconnect();
}

checkVendor().catch(console.error);
