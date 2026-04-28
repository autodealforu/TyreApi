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
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const destroyData = async () => {
  try {
    console.log('🗑️  Destroying existing data...');

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

const createTestData = async () => {
  try {
    console.log('🚀 Creating comprehensive test data...\n');

    // Step 1: Destroy existing data
    await destroyData();

    // Step 2: Get or create a test user for created_by field
    let testUser = await User.findOne();
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        phone: '9999999999',
        username: 'testadmin',
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Using existing user');
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

    console.log('🚗 Creating tyre products...');

    // Step 5: Create minimal tyres
    const tyres = await TyreModel.insertMany([
      {
        created_by: testUser._id,
        tyreWidthType: 'MM',
        productDescription: 'Premium touring tyre with excellent wet grip',
        productImages: [
          'https://via.placeholder.com/400x400/000000/FFFFFF?text=Michelin+Tyre',
        ],
      },
      {
        created_by: testUser._id,
        tyreWidthType: 'MM',
        productDescription: 'High-performance tyre for luxury sedans',
        productImages: [
          'https://via.placeholder.com/400x400/333333/FFFFFF?text=Bridgestone+Tyre',
        ],
      },
      {
        created_by: testUser._id,
        tyreWidthType: 'MM',
        productDescription: 'Eco-friendly tyre with low rolling resistance',
        productImages: [
          'https://via.placeholder.com/400x400/555555/FFFFFF?text=Continental+Tyre',
        ],
      },
    ]);

    console.log('⚙️ Creating alloy wheel products...');

    // Step 6: Create minimal alloy wheels
    const alloyWheels = await AlloyWheel.insertMany([
      {
        wheel_name: 'OZ Racing Ultraleggera',
        wheel_description: 'Lightweight racing wheels for performance cars',
        diameter: '17',
        width: '7.5',
        pcd: '5x112',
        offset: '+45',
        finish: 'Matt Bronze',
      },
      {
        wheel_name: 'BBS CH-R',
        wheel_description: 'Classic design with modern technology',
        diameter: '18',
        width: '8.0',
        pcd: '5x120',
        offset: '+35',
        finish: 'Satin Black',
      },
    ]);

    console.log('🔧 Creating service products...');

    // Step 7: Create minimal services
    const services = await Service.insertMany([
      {
        serviceName: 'Tyre Installation & Balancing',
        serviceDescription:
          'Professional tyre installation with computerized wheel balancing',
        serviceShortName: 'Tyre Install',
        serviceType: 'Installation',
        estimatedTime: '30-45 minutes',
        serviceImages: [
          'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Tyre+Installation',
        ],
      },
      {
        serviceName: '4-Wheel Alignment',
        serviceDescription:
          'Computerized wheel alignment for optimal tyre wear',
        serviceShortName: 'Wheel Alignment',
        serviceType: 'Alignment',
        estimatedTime: '45-60 minutes',
        serviceImages: [
          'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Wheel+Alignment',
        ],
      },
      {
        serviceName: 'Brake Pad Replacement',
        serviceDescription:
          'Complete brake pad replacement with brake fluid check',
        serviceShortName: 'Brake Service',
        serviceType: 'Repair',
        estimatedTime: '60-90 minutes',
        serviceImages: [
          'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Brake+Service',
        ],
      },
    ]);

    console.log('📦 Creating unified products...');

    // Step 8: Create unified products
    const products = [];

    // Tyre Products
    for (let i = 0; i < tyres.length; i++) {
      const tyre = tyres[i];
      const brand = brands[i] || brands[0];
      const vendor = vendors[i % vendors.length];

      const product = await Product.create({
        product_category: 'TYRE',
        tyre: tyre._id,
        product_name: `Premium Tyre Model ${i + 1}`,
        product_description: tyre.productDescription,
        brand: brand._id,
        vendor: vendor._id,
        cost_price: 3000 + i * 500,
        mrp_price: 5000 + i * 500,
        rcp_price: 5000 + i * 500,
        auto_deal_price: 4200 + i * 500,
        stock_quantity: 50 - i * 5,
        product_images: tyre.productImages,
      });
      products.push(product);
    }

    // Alloy Wheel Products
    for (let i = 0; i < alloyWheels.length; i++) {
      const wheel = alloyWheels[i];
      const brand = brands[5 + i] || brands[5];
      const vendor = vendors[i % vendors.length];

      const product = await Product.create({
        product_category: 'ALLOY_WHEEL',
        alloy_wheel: wheel._id,
        product_name: wheel.wheel_name,
        product_description: wheel.wheel_description,
        brand: brand._id,
        vendor: vendor._id,
        cost_price: 8000 + i * 2000,
        mrp_price: 12000 + i * 3000,
        rcp_price: 12000 + i * 3000,
        auto_deal_price: 10000 + i * 2500,
        stock_quantity: 20 - i * 3,
        product_images: [
          'https://via.placeholder.com/400x400/444444/FFFFFF?text=Alloy+Wheel',
        ],
      });
      products.push(product);
    }

    // Service Products
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const brand = brands[8 + (i % 2)] || brands[8];
      const vendor = vendors[i % vendors.length];

      const product = await Product.create({
        product_category: 'SERVICE',
        service: service._id,
        product_name: service.serviceName,
        product_description: service.serviceDescription,
        brand: brand._id,
        vendor: vendor._id,
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
    console.log('\n🎉 COMPREHENSIVE SEEDER COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Test User: 1`);
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Vendors: ${vendors.length}`);
    console.log(`✅ Tyres: ${tyres.length}`);
    console.log(`✅ Alloy Wheels: ${alloyWheels.length}`);
    console.log(`✅ Services: ${services.length}`);
    console.log(`✅ Total Products: ${products.length}`);
    console.log('=====================================');
    console.log('🌐 Ready for testing the multi-product system!');
    console.log('🔗 Test URLs:');
    console.log('   - Homepage: http://localhost:3001/');
    console.log('   - Tyres: http://localhost:3001/tyres');
    console.log('   - Alloy Wheels: http://localhost:3001/alloy-wheels');
    console.log('   - Services: http://localhost:3001/services');
    console.log('   - Cart: http://localhost:3001/cart');

    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error}`);
    console.error(error.stack);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData().then(() => {
    console.log('✅ Data destroyed successfully!');
    process.exit();
  });
} else {
  createTestData();
}
