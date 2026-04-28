// Script to add more vendors for the same tyre to test multi-vendor single product page
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from './api/products/ProductModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const addMoreVendorsForSameTyre = async () => {
  try {
    console.log('🚀 Adding more vendors for the same tyre specification...');

    // Get existing data
    const brands = await Brand.find().limit(10);
    const vendors = await Vendor.find().limit(3);

    // Use the first tyre spec ID from our previous multi-vendor API response
    const tyreSpecId = '68a221a9949b2a2b8856a928';

    // Create additional products with the same tyre specification but different vendors and prices
    const additionalProducts = [
      {
        vendor: vendors[1]._id, // Different vendor
        brand: brands[1]._id,
        cost_price: 3200,
        mrp_price: 5500,
        auto_deal_price: 4300,
        name: 'High-Performance Summer Tyre - Premium',
      },
      {
        vendor: vendors[2]._id, // Different vendor
        brand: brands[2]._id,
        cost_price: 2800,
        mrp_price: 4800,
        auto_deal_price: 3900,
        name: 'High-Performance Summer Tyre - Economy',
      },
    ];

    for (let i = 0; i < additionalProducts.length; i++) {
      const productInfo = additionalProducts[i];

      const product = await Product.create({
        product_category: 'TYRE',
        tyre: tyreSpecId, // Same tyre specification
        product_name: productInfo.name,
        product_description:
          'Premium summer tyre for sports cars with excellent grip and performance',
        brand: productInfo.brand,
        vendor: productInfo.vendor,
        cost_price: productInfo.cost_price,
        mrp_price: productInfo.mrp_price,
        rcp_price: productInfo.mrp_price,
        auto_deal_price: productInfo.auto_deal_price,
        stock_quantity: 25 + i * 10,
        product_images: [
          'https://via.placeholder.com/400x400/2C3E50/FFFFFF?text=Tyre+1',
        ],
        published_status: 'PUBLISHED',
        product_status: 'Active',
        in_stock: true,
        published_date: new Date(),
      });

      console.log(
        `✅ Created additional product: ${product.product_name} for vendor ${
          i + 2
        }`
      );
    }

    console.log('\n🎉 ADDITIONAL VENDORS ADDED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(
      `✅ Added ${additionalProducts.length} more vendors for the same tyre`
    );
    console.log('🔗 Test the single product API:');
    console.log(
      `   - Single product: http://localhost:9042/api/products/website/single-product/TYRE/${tyreSpecId}`
    );
    console.log(
      '✅ Now you should see multiple vendors for the same tyre specification!'
    );

    process.exit();
  } catch (error) {
    console.error('❌ Error adding vendors:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

addMoreVendorsForSameTyre();
