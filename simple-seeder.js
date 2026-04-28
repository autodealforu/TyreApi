import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import required models
import Product from './api/products/ProductModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const destroyData = async () => {
  try {
    console.log('🗑️  Destroying existing product data...');

    // Delete only products, keep supporting data
    await Product.deleteMany();

    console.log('✅ Existing product data destroyed!');
  } catch (error) {
    console.error(`❌ Error destroying data: ${error}`);
    throw error;
  }
};

const createMinimalTestData = async () => {
  try {
    console.log('🚀 Creating minimal test data for multi-product system...\n');

    // Step 1: Destroy existing products
    await destroyData();

    // Step 2: Get or create brands
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

    // Step 3: Get or create vendors
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

    // Step 4: Create simple products for all 3 categories
    const products = [];

    // TYRE Products (5 products)
    const tyreProducts = [
      {
        product_category: 'TYRE',
        product_name: 'Michelin Primacy 4 - 215/55R17',
        product_description:
          'Premium touring tyre with excellent wet grip and longevity. Perfect for sedans and hatchbacks.',
        brand: brands.find((b) => b.name === 'Michelin')?._id || brands[0]._id,
        vendor: vendors[0]._id,
        cost_price: 4000,
        mrp_price: 6000,
        rcp_price: 6000,
        auto_deal_price: 5200,
        stock_quantity: 50,
        product_images: [
          'https://via.placeholder.com/400x400/000000/FFFFFF?text=Michelin+Tyre',
        ],
      },
      {
        product_category: 'TYRE',
        product_name: 'Bridgestone Turanza T005 - 205/60R16',
        product_description:
          'High-performance tyre for luxury sedans with superior handling and comfort.',
        brand:
          brands.find((b) => b.name === 'Bridgestone')?._id || brands[1]._id,
        vendor: vendors[1]._id,
        cost_price: 3500,
        mrp_price: 5500,
        rcp_price: 5500,
        auto_deal_price: 4800,
        stock_quantity: 40,
        product_images: [
          'https://via.placeholder.com/400x400/333333/FFFFFF?text=Bridgestone+Tyre',
        ],
      },
      {
        product_category: 'TYRE',
        product_name: 'Continental ContiEcoContact 6 - 195/65R15',
        product_description:
          'Eco-friendly tyre with low rolling resistance for fuel efficiency.',
        brand:
          brands.find((b) => b.name === 'Continental')?._id || brands[2]._id,
        vendor: vendors[0]._id,
        cost_price: 3800,
        mrp_price: 5800,
        rcp_price: 5800,
        auto_deal_price: 5000,
        stock_quantity: 35,
        product_images: [
          'https://via.placeholder.com/400x400/555555/FFFFFF?text=Continental+Tyre',
        ],
      },
      {
        product_category: 'TYRE',
        product_name: 'Pirelli P7 Cinturato - 225/45R18',
        product_description:
          'Sport touring tyre with superior handling and performance.',
        brand: brands.find((b) => b.name === 'Pirelli')?._id || brands[3]._id,
        vendor: vendors[1]._id,
        cost_price: 4200,
        mrp_price: 6200,
        rcp_price: 6200,
        auto_deal_price: 5400,
        stock_quantity: 30,
        product_images: [
          'https://via.placeholder.com/400x400/777777/FFFFFF?text=Pirelli+Tyre',
        ],
      },
      {
        product_category: 'TYRE',
        product_name: 'Goodyear Assurance Triplemax 2 - 185/60R15',
        product_description:
          'All-season tyre with enhanced safety features and durability.',
        brand: brands.find((b) => b.name === 'Goodyear')?._id || brands[4]._id,
        vendor: vendors[2]._id,
        cost_price: 3200,
        mrp_price: 4800,
        rcp_price: 4800,
        auto_deal_price: 4200,
        stock_quantity: 60,
        product_images: [
          'https://via.placeholder.com/400x400/999999/FFFFFF?text=Goodyear+Tyre',
        ],
      },
    ];

    // ALLOY WHEEL Products (4 products)
    const alloyWheelProducts = [
      {
        product_category: 'ALLOY_WHEEL',
        product_name: 'OZ Racing Ultraleggera 17x7.5',
        product_description:
          'Lightweight racing wheels for performance cars. Matt Bronze finish with 5x112 PCD.',
        brand: brands.find((b) => b.name === 'OZ Racing')?._id || brands[5]._id,
        vendor: vendors[0]._id,
        cost_price: 8000,
        mrp_price: 12000,
        rcp_price: 12000,
        auto_deal_price: 10500,
        stock_quantity: 20,
        product_images: [
          'https://via.placeholder.com/400x400/444444/FFFFFF?text=OZ+Racing+Wheel',
        ],
      },
      {
        product_category: 'ALLOY_WHEEL',
        product_name: 'BBS CH-R 18x8.0',
        product_description:
          'Classic design with modern technology. Satin Black finish with 5x120 PCD.',
        brand: brands.find((b) => b.name === 'BBS')?._id || brands[6]._id,
        vendor: vendors[1]._id,
        cost_price: 15000,
        mrp_price: 22000,
        rcp_price: 22000,
        auto_deal_price: 19000,
        stock_quantity: 15,
        product_images: [
          'https://via.placeholder.com/400x400/666666/FFFFFF?text=BBS+Wheel',
        ],
      },
      {
        product_category: 'ALLOY_WHEEL',
        product_name: 'Enkei RPF1 17x8.0',
        product_description:
          'Legendary lightweight wheel for motorsports. Silver finish with 5x114.3 PCD.',
        brand: brands.find((b) => b.name === 'Enkei')?._id || brands[7]._id,
        vendor: vendors[0]._id,
        cost_price: 12000,
        mrp_price: 18000,
        rcp_price: 18000,
        auto_deal_price: 15500,
        stock_quantity: 25,
        product_images: [
          'https://via.placeholder.com/400x400/888888/FFFFFF?text=Enkei+Wheel',
        ],
      },
      {
        product_category: 'ALLOY_WHEEL',
        product_name: 'OZ Racing Alleggerita 16x7.0',
        product_description:
          'Track-focused lightweight alloy wheels. White finish with 4x100 PCD.',
        brand: brands.find((b) => b.name === 'OZ Racing')?._id || brands[5]._id,
        vendor: vendors[2]._id,
        cost_price: 10000,
        mrp_price: 15000,
        rcp_price: 15000,
        auto_deal_price: 13000,
        stock_quantity: 18,
        product_images: [
          'https://via.placeholder.com/400x400/AAAAAA/000000?text=OZ+Alleggerita',
        ],
      },
    ];

    // SERVICE Products (5 products)
    const serviceProducts = [
      {
        product_category: 'SERVICE',
        product_name: 'Tyre Installation & Balancing',
        product_description:
          'Professional tyre installation with computerized wheel balancing. Includes mounting, balancing, and valve replacement.',
        brand:
          brands.find((b) => b.name === 'Service Pro')?._id || brands[8]._id,
        vendor: vendors[2]._id,
        cost_price: 200,
        mrp_price: 500,
        rcp_price: 500,
        auto_deal_price: 400,
        stock_quantity: 999,
        product_images: [
          'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Tyre+Installation',
        ],
      },
      {
        product_category: 'SERVICE',
        product_name: '4-Wheel Alignment',
        product_description:
          'Computerized wheel alignment for optimal tyre wear and handling. Includes camber and toe adjustments.',
        brand:
          brands.find((b) => b.name === 'Service Pro')?._id || brands[8]._id,
        vendor: vendors[0]._id,
        cost_price: 800,
        mrp_price: 1500,
        rcp_price: 1500,
        auto_deal_price: 1200,
        stock_quantity: 999,
        product_images: [
          'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Wheel+Alignment',
        ],
      },
      {
        product_category: 'SERVICE',
        product_name: 'Brake Pad Replacement',
        product_description:
          'Complete brake pad replacement with brake fluid check. Includes brake disc inspection and safety test.',
        brand: brands.find((b) => b.name === 'QuickFix')?._id || brands[9]._id,
        vendor: vendors[1]._id,
        cost_price: 1500,
        mrp_price: 2500,
        rcp_price: 2500,
        auto_deal_price: 2000,
        stock_quantity: 999,
        product_images: [
          'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Brake+Service',
        ],
      },
      {
        product_category: 'SERVICE',
        product_name: 'Complete Vehicle Inspection',
        product_description:
          'Comprehensive 50-point vehicle inspection and detailed report. Covers engine, brakes, suspension, and battery.',
        brand:
          brands.find((b) => b.name === 'Service Pro')?._id || brands[8]._id,
        vendor: vendors[2]._id,
        cost_price: 500,
        mrp_price: 1000,
        rcp_price: 1000,
        auto_deal_price: 750,
        stock_quantity: 999,
        product_images: [
          'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Vehicle+Inspection',
        ],
      },
      {
        product_category: 'SERVICE',
        product_name: 'Mobile Tyre Fitting',
        product_description:
          'Convenient tyre fitting service at your location. Includes mobile service, installation, and old tyre disposal.',
        brand: brands.find((b) => b.name === 'QuickFix')?._id || brands[9]._id,
        vendor: vendors[0]._id,
        cost_price: 300,
        mrp_price: 800,
        rcp_price: 800,
        auto_deal_price: 600,
        stock_quantity: 999,
        product_images: [
          'https://via.placeholder.com/400x400/FFEAA7/000000?text=Mobile+Service',
        ],
      },
    ];

    // Combine all products
    const allProducts = [
      ...tyreProducts,
      ...alloyWheelProducts,
      ...serviceProducts,
    ];

    // Step 5: Insert all products
    const createdProducts = await Product.insertMany(allProducts);

    // Summary
    console.log('\n🎉 MINIMAL SEEDER COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Vendors: ${vendors.length}`);
    console.log(`✅ Tyre Products: ${tyreProducts.length}`);
    console.log(`✅ Alloy Wheel Products: ${alloyWheelProducts.length}`);
    console.log(`✅ Service Products: ${serviceProducts.length}`);
    console.log(`✅ Total Products: ${createdProducts.length}`);
    console.log('=====================================');
    console.log('🌐 Ready for testing the multi-product system!');
    console.log('🔗 URLs to test:');
    console.log('   - Homepage: http://localhost:3001/');
    console.log('   - Tyres: http://localhost:3001/tyres');
    console.log('   - Alloy Wheels: http://localhost:3001/alloy-wheels');
    console.log('   - Services: http://localhost:3001/services');

    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData().then(() => {
    console.log('✅ Product data destroyed successfully!');
    process.exit();
  });
} else {
  createMinimalTestData();
}
