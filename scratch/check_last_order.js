import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../api/orders/OrderModel.js';
import User from '../api/users/UserModel.js';

dotenv.config();

const checkOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    if (!lastOrder) {
      console.log('No orders found');
      return;
    }

    console.log('--- Last Order ---');
    console.log('ID:', lastOrder._id);
    console.log('Order ID:', lastOrder.order_id);
    console.log('Status:', lastOrder.status);
    console.log('Published Status:', lastOrder.published_status);
    console.log('Created At:', lastOrder.createdAt);
    
    if (lastOrder.products) {
        console.log('Products Count:', lastOrder.products.length);
        lastOrder.products.forEach((p, index) => {
            console.log(`Product ${index + 1} Vendor:`, p.vendor);
        });
    } else {
        console.log('NO PRODUCTS ARRAY');
    }

    const vendors = lastOrder.products ? lastOrder.products.map(p => p.vendor).filter(v => v) : [];
    console.log('Vendors in order:', vendors);

    if (vendors.length > 0) {
        const vendorDetails = await User.find({ _id: { $in: vendors } });
        console.log('Vendor Details:', vendorDetails.map(v => ({ id: v._id, name: v.name, role: v.role, store_name: v.vendor?.store_name })));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkOrder();
