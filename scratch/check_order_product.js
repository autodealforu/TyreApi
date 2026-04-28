import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../api/orders/OrderModel.js';
import Product from '../api/products/ProductModel.js';

dotenv.config();

const checkOrderProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    if (!lastOrder || !lastOrder.products || lastOrder.products.length === 0) {
      console.log('No products in order');
      return;
    }

    const productId = lastOrder.products[0].product;
    const product = await Product.findById(productId);
    
    console.log('--- Last Order Product ---');
    console.log('Product ID:', productId);
    console.log('Vendor in Order data:', lastOrder.products[0].vendor);
    if (product) {
        console.log('Vendor ID in Product database:', product.vendor);
    } else {
        console.log('Product NOT FOUND in database');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkOrderProduct();
