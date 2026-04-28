// Script to add more vendors for alloy wheels to test single product page
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from './api/products/ProductModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import AlloyWheel from './api/alloy-wheels/alloyWheelModel.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const addMoreAlloyWheelVendors = async () => {
  try {
    console.log('🚀 Adding more vendors for alloy wheels...');

    // Get existing data
    const brands = await Brand.find().limit(10);
    const vendors = await Vendor.find().limit(3);
    const alloyWheels = await AlloyWheel.find().limit(1);

    if (alloyWheels.length === 0) {
      console.log('❌ No alloy wheels found in database');
      process.exit(1);
    }

    const alloyWheelId = alloyWheels[0]._id;

    // Create additional products with the same alloy wheel but different vendors
    const additionalProducts = [
      {
        vendor: vendors[1]._id,
        brand: brands[1]._id,
        cost_price: 2500,
        mrp_price: 4200,
        auto_deal_price: 3500,
        name: 'Premium Alloy Wheel - Performance',
      },
      {
        vendor: vendors[2]._id,
        brand: brands[2]._id,
        cost_price: 2200,
        mrp_price: 3800,
        auto_deal_price: 3200,
        name: 'Premium Alloy Wheel - Economy',
      },
    ];

    for (let i = 0; i < additionalProducts.length; i++) {
      const productInfo = additionalProducts[i];

      const product = await Product.create({
        product_category: 'ALLOY_WHEEL',
        alloy_wheel: alloyWheelId,
        product_name: productInfo.name,
        product_description:
          'Premium alloy wheel with excellent durability and style',
        brand: productInfo.brand,
        vendor: productInfo.vendor,
        cost_price: productInfo.cost_price,
        mrp_price: productInfo.mrp_price,
        rcp_price: productInfo.mrp_price,
        auto_deal_price: productInfo.auto_deal_price,
        stock_quantity: 20 + i * 5,
        product_images: [
          'https://via.placeholder.com/400x400/34495E/FFFFFF?text=Alloy+Wheel',
        ],
        published_status: 'PUBLISHED',
        product_status: 'Active',
        in_stock: true,
        published_date: new Date(),
      });

      console.log(
        `✅ Created additional alloy wheel product: ${product.product_name}`
      );
    }

    console.log('\n🎉 ADDITIONAL ALLOY WHEEL VENDORS ADDED!');
    console.log('========================================');
    console.log(
      `✅ Added ${additionalProducts.length} more vendors for alloy wheels`
    );
    console.log('🔗 Test the single product API:');
    console.log(
      `   - Single product: http://localhost:9042/api/products/website/single-product/ALLOY_WHEEL/${alloyWheelId}`
    );

    process.exit();
  } catch (error) {
    console.error('❌ Error adding alloy wheel vendors:', error);
    process.exit(1);
  }
};

addMoreAlloyWheelVendors();
