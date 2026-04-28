import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/users/UserModel.js';
import Product from '../api/products/ProductModel.js';
import Tyre from '../api/tyres/TyreModel.js';
import AlloyWheel from '../api/alloy-wheels/alloyWheelModel.js';
import Service from '../api/services/ServiceModel.js';
import Order from '../api/orders/OrderModel.js';
import Notification from '../api/notifications/NotificationModel.js';

dotenv.config();

const cleanupVendorData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Find all vendors
    const vendors = await User.find({ role: 'VENDOR' });
    const vendorIds = vendors.map(v => v._id);
    console.log(`Found ${vendorIds.length} vendors to delete.`);

    if (vendorIds.length === 0) {
      console.log('No vendors found.');
      await mongoose.disconnect();
      return;
    }

    // 2. Find all products associated with these vendors
    const products = await Product.find({ vendor: { $in: vendorIds } });
    const productIds = products.map(p => p._id);
    console.log(`Found ${productIds.length} products to delete.`);

    // 3. Find sub-product IDs (to avoid orphans)
    const tyreIds = products.filter(p => p.product_category === 'TYRE').map(p => p.tyre);
    const alloyWheelIds = products.filter(p => p.product_category === 'ALLOY_WHEEL').map(p => p.alloy_wheel);
    const serviceIds = products.filter(p => p.product_category === 'SERVICE').map(p => p.service);

    // 4. Perform deletions
    console.log('Starting deletion process...');

    // Delete Sub-Products
    if (tyreIds.length > 0) await Tyre.deleteMany({ _id: { $in: tyreIds } });
    if (alloyWheelIds.length > 0) await AlloyWheel.deleteMany({ _id: { $in: alloyWheelIds } });
    if (serviceIds.length > 0) await Service.deleteMany({ _id: { $in: serviceIds } });
    console.log('Sub-products (Tyres, Alloy Wheels, Services) deleted.');

    // Delete Products
    if (productIds.length > 0) await Product.deleteMany({ _id: { $in: productIds } });
    console.log('Products deleted.');

    // Delete Vendor-specific Notifications
    await Notification.deleteMany({ user: { $in: vendorIds } });
    console.log('Vendor notifications deleted.');

    // Delete Orders associated with these vendors
    const deletedOrders = await Order.deleteMany({ 'products.vendor': { $in: vendorIds } });
    console.log(`Deleted ${deletedOrders.deletedCount} orders associated with these vendors.`);

    // Delete Vendors
    await User.deleteMany({ _id: { $in: vendorIds } });
    console.log('Vendors deleted.');

    console.log('Cleanup complete! Database is now clean of vendor data.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};

cleanupVendorData();
