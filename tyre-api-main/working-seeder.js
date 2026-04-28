import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import required models
import Product from './api/products/ProductModel.js';
import TyreModel from './api/tyres/TyreModel.js';
import AlloyWheel from './api/alloy-wheels/alloyWheelModel.js';
import Service from './api/services/ServiceModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import User from './api/users/UserModel.js';
import TyreWidth from './api/tyre-widths/tyreWidthModel.js';
import RimDiameter from './api/rim-diameters/rimDiameterModel.js';

// Import alloy wheel supporting models
import AlloyDiameter from './api/alloy-wheels/AlloyDiameterModel.js';
import AlloyWidth from './api/alloy-wheels/AlloyWidthModel.js';
import AlloyPCD from './api/alloy-wheels/AlloyPCDModel.js';
import AlloyOffset from './api/alloy-wheels/AlloyOffsetModel.js';
import AlloyBoreSize from './api/alloy-wheels/AlloyBoreSizeModel.js';
import AlloyFinish from './api/alloy-wheels/AlloyFinishModel.js';

import connectDB from './config/db.js';

dotenv.config();

connectDB();

const destroyData = async () => {
  try {
    console.log('🗑️  Destroying existing product data...');

    // Delete all products and related data
    await Product.deleteMany();
    await TyreModel.deleteMany();
    await AlloyWheel.deleteMany();
    await Service.deleteMany();

    console.log('✅ Existing product data destroyed!');
  } catch (error) {
    console.error(`❌ Error destroying data: ${error}`);
    throw error;
  }
};

const createWorkingTestData = async () => {
  try {
    console.log(
      '🚀 Creating working test data using existing supporting models...\n'
    );

    // Step 1: Destroy existing data
    await destroyData();

    // Step 2: Get existing supporting data
    const testUser = await User.findOne();
    const tyreWidths = await TyreWidth.find().limit(3);
    const rimDiameters = await RimDiameter.find().limit(3);

    // Get supporting alloy wheel data
    const alloyDiameters = await AlloyDiameter.find().limit(3);
    const alloyWidths = await AlloyWidth.find().limit(3);
    const alloyPCDs = await AlloyPCD.find().limit(3);
    const alloyOffsets = await AlloyOffset.find().limit(3);
    const alloyBoreSizes = await AlloyBoreSize.find().limit(3);
    const alloyFinishes = await AlloyFinish.find().limit(3);

    if (!testUser) {
      console.log('❌ No user found. Creating test user...');
      const newUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        phone: '9999999999',
        username: 'testadmin',
      });
      console.log('✅ Created test user');
    }

    if (tyreWidths.length === 0 || rimDiameters.length === 0) {
      console.log(
        '❌ Missing supporting data for tyres. Skipping tyre creation.'
      );
    }

    // Step 3: Get or create brands
    let brands = await Brand.find().limit(10);
    if (brands.length === 0) {
      brands = await Brand.insertMany([
        { name: 'Michelin' },
        { name: 'Bridgestone' },
        { name: 'Continental' },
        { name: 'Pirelli' },
        { name: 'Goodyear' },
        { name: 'OZ Racing' },
        { name: 'BBS' },
        { name: 'Enkei' },
        { name: 'Service Pro' },
        { name: 'QuickFix' },
      ]);
      console.log(`✅ Created ${brands.length} brands`);
    } else {
      console.log(`✅ Using existing ${brands.length} brands`);
    }

    // Step 4: Get or create vendors
    let vendors = await Vendor.find().limit(3);
    if (vendors.length === 0) {
      vendors = await Vendor.insertMany([
        {
          name: 'Premium Tyre Store',
          username: 'vendor1',
          password: 'password123',
          phone: '9876543210',
          email: 'vendor1@example.com',
          store_name: 'Premium Tyre Store',
        },
        {
          name: 'Wheel World',
          username: 'vendor2',
          password: 'password123',
          phone: '9876543211',
          email: 'vendor2@example.com',
          store_name: 'Wheel World',
        },
        {
          name: 'Auto Service Center',
          username: 'vendor3',
          password: 'password123',
          phone: '9876543212',
          email: 'vendor3@example.com',
          store_name: 'Auto Service Center',
        },
      ]);
      console.log(`✅ Created ${vendors.length} vendors`);
    } else {
      console.log(`✅ Using existing ${vendors.length} vendors`);
    }

    const products = [];

    // Step 5: Create tyre products (if supporting data exists)
    if (tyreWidths.length > 0 && rimDiameters.length > 0 && testUser) {
      console.log('🚗 Creating tyre products...');

      for (let i = 0; i < 3; i++) {
        const tyre = await TyreModel.create({
          created_by: testUser._id,
          tyreWidthType: 'MM',
          tyreWidth: tyreWidths[i % tyreWidths.length]._id,
          rimDiameter: rimDiameters[i % rimDiameters.length]._id,
          productDescription: `Premium tyre model ${
            i + 1
          } with excellent performance`,
          productImages: [
            `https://via.placeholder.com/400x400/00000${i}/FFFFFF?text=Tyre+${
              i + 1
            }`,
          ],
        });

        const product = await Product.create({
          product_category: 'TYRE',
          tyre: tyre._id,
          product_name: `Premium Tyre ${i + 1} - ${
            tyreWidths[i % tyreWidths.length].name
          }/${rimDiameters[i % rimDiameters.length].name}`,
          product_description: tyre.productDescription,
          brand: brands[i % brands.length]._id,
          vendor: vendors[i % vendors.length]._id,
          cost_price: 3000 + i * 500,
          mrp_price: 5000 + i * 500,
          rcp_price: 5000 + i * 500,
          auto_deal_price: 4200 + i * 500,
          stock_quantity: 50 - i * 5,
          product_images: tyre.productImages,
        });

        products.push(product);
      }
    } else {
      console.log('⚠️  Missing tyre supporting data. Skipping tyre creation.');
    }

    // Step 6: Create a simple alloy wheel product (skipping complex validation for now)
    console.log('⚙️ Creating simple alloy wheel product...');

    try {
      const wheel = await AlloyWheel.create({
        alloyDiameterInches: alloyDiameters?.[0]?._id || alloyDiameters[0]._id,
        alloyWidth: alloyWidths?.[0]?._id || alloyWidths[0]._id,
        alloyPCD: alloyPCDs?.[0]?._id || alloyPCDs[0]._id,
        alloyOffset: alloyOffsets?.[0]?._id || alloyOffsets[0]._id,
        alloyBoreSizeMM: alloyBoreSizes?.[0]?._id || alloyBoreSizes[0]._id,
        alloyBrand: brands[5]._id,
        alloyDesignName: 'Test Wheel',
        alloyFinish: alloyFinishes?.[0]?._id || alloyFinishes[0]._id,
        created_by: testUser._id,
        productImages: ['https://via.placeholder.com/400x400/444444/FFFFFF?text=Wheel+1'],
        productDescription: 'Test alloy wheel',
        published_status: 'PUBLISHED',
      });

      const product = await Product.create({
        product_category: 'ALLOY_WHEEL',
        alloy_wheel: wheel._id,
        product_name: 'Test Alloy Wheel',
        product_description: 'Test alloy wheel description',
        brand: brands[5]._id,
        vendor: vendors[0]._id,
        cost_price: 8000,
        mrp_price: 12000,
        rcp_price: 12000,
        auto_deal_price: 10000,
        stock_quantity: 20,
        product_images: wheel.productImages,
      });

      products.push(product);
      console.log('✅ Created alloy wheel product');
    } catch (error) {
      console.log('⚠️  Skipping alloy wheel creation due to missing data:', error.message);
    }
        product_name: wheelInfo.name,
        product_description: wheel.wheel_description,
        brand: brands[(5 + i) % brands.length]._id,
        vendor: vendors[i % vendors.length]._id,
        cost_price: 8000 + i * 2000,
        mrp_price: 12000 + i * 3000,
        rcp_price: 12000 + i * 3000,
        auto_deal_price: 10000 + i * 2500,
        stock_quantity: 20 - i * 3,
        product_images: [
          `https://via.placeholder.com/400x400/44444${i}/FFFFFF?text=Wheel+${
            i + 1
          }`,
        ],
      });

      products.push(product);
    }

    // Step 7: Create service products
    console.log('🔧 Creating service products...');

    const serviceData = [
      {
        name: 'Tyre Installation & Balancing',
        short: 'Tyre Install',
        type: 'Installation',
        time: '30-45 minutes',
      },
      {
        name: '4-Wheel Alignment',
        short: 'Wheel Alignment',
        type: 'Alignment',
        time: '45-60 minutes',
      },
      {
        name: 'Brake Pad Replacement',
        short: 'Brake Service',
        type: 'Repair',
        time: '60-90 minutes',
      },
      {
        name: 'Complete Vehicle Inspection',
        short: 'Vehicle Inspection',
        type: 'Inspection',
        time: '90-120 minutes',
      },
    ];

    for (let i = 0; i < serviceData.length; i++) {
      const serviceInfo = serviceData[i];

      const service = await Service.create({
        serviceName: serviceInfo.name,
        serviceDescription: `Professional ${serviceInfo.name.toLowerCase()} service with expert technicians`,
        serviceShortName: serviceInfo.short,
        serviceType: serviceInfo.type,
        estimatedTime: serviceInfo.time,
        serviceImages: [
          `https://via.placeholder.com/400x400/FF6B6${i}/FFFFFF?text=Service+${
            i + 1
          }`,
        ],
      });

      const product = await Product.create({
        product_category: 'SERVICE',
        service: service._id,
        product_name: serviceInfo.name,
        product_description: service.serviceDescription,
        brand: brands[(8 + (i % 2)) % brands.length]._id,
        vendor: vendors[i % vendors.length]._id,
        cost_price: 500 + i * 300,
        mrp_price: 1000 + i * 500,
        rcp_price: 1000 + i * 500,
        auto_deal_price: 750 + i * 400,
        stock_quantity: 999,
        product_images: service.serviceImages,
      });

      products.push(product);
    }

    // Summary
    console.log('\n🎉 WORKING TEST DATA CREATED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Vendors: ${vendors.length}`);
    console.log(`✅ Total Products Created: ${products.length}`);
    console.log(
      `   - Tyres: ${
        products.filter((p) => p.product_category === 'TYRE').length
      }`
    );
    console.log(
      `   - Alloy Wheels: ${
        products.filter((p) => p.product_category === 'ALLOY_WHEEL').length
      }`
    );
    console.log(
      `   - Services: ${
        products.filter((p) => p.product_category === 'SERVICE').length
      }`
    );
    console.log('=====================================');
    console.log('🌐 Ready for testing the multi-product system!');
    console.log('🔗 Test URLs:');
    console.log('   - Homepage: http://localhost:3001/');
    console.log('   - Tyres: http://localhost:3001/tyres');
    console.log('   - Alloy Wheels: http://localhost:3001/alloy-wheels');
    console.log('   - Services: http://localhost:3001/services');
    console.log('   - Cart: http://localhost:3001/cart');
    console.log(
      '\n🚀 You can now test adding products to cart and the complete flow!'
    );

    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error}`);
    console.error(error.stack);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData().then(() => {
    console.log('✅ Product data destroyed successfully!');
    process.exit();
  });
} else {
  createWorkingTestData();
}
