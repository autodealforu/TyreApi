import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../api/products/ProductModel.js';
import User from '../api/users/UserModel.js';

dotenv.config();

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).populate('vendor', 'name role');
    console.log('All Products and their vendors:');
    products.forEach(p => {
        console.log(`- Product: ${p.name || 'Unnamed'}, Category: ${p.product_category}, Vendor: ${p.vendor ? p.vendor.name + ' (' + p.vendor._id + ')' : 'None'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkProducts();
