const mongoose = require('mongoose');

async function checkProduct() {
  await mongoose.connect('mongodb://localhost:27017/multivendor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const specId = '69eb1e0755bd15733c8d9572';
  const objId = new mongoose.Types.ObjectId(specId);

  const products = await mongoose.connection.db.collection('products').find({ tyre: objId }).toArray();
  console.log('Linked Products found:', products.length);
  products.forEach(p => {
      console.log(`Product ID: ${p._id}, Status: ${p.product_status}, Published: ${p.published_status}, InStock: ${p.in_stock}`);
  });

  await mongoose.disconnect();
}

checkProduct().catch(console.error);
