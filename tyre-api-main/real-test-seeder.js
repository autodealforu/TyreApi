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

const createRealTestData = async () => {
  try {
    console.log('🚀 Creating REAL test data for comprehensive testing...\n');

    // Step 1: Destroy existing data
    await destroyData();

    // Step 2: Get existing supporting data
    const testUser = await User.findOne();
    const tyreWidths = await TyreWidth.find().limit(5);
    const rimDiameters = await RimDiameter.find().limit(5);
    const brands = await Brand.find().limit(10);
    const vendors = await Vendor.find().limit(5);

    if (
      !testUser ||
      tyreWidths.length === 0 ||
      rimDiameters.length === 0 ||
      brands.length === 0 ||
      vendors.length === 0
    ) {
      console.log('❌ Missing required supporting data');
      console.log(`   Users: ${testUser ? 1 : 0}`);
      console.log(`   TyreWidths: ${tyreWidths.length}`);
      console.log(`   RimDiameters: ${rimDiameters.length}`);
      console.log(`   Brands: ${brands.length}`);
      console.log(`   Vendors: ${vendors.length}`);
      process.exit(1);
    }

    console.log('✅ Found all required supporting data');
    console.log(
      `   TyreWidths: ${tyreWidths.length}, RimDiameters: ${rimDiameters.length}`
    );
    console.log(`   Brands: ${brands.length}, Vendors: ${vendors.length}`);

    const products = [];

    // Step 3: Create tyre products using existing supporting data
    console.log('🚗 Creating tyre products...');

    const tyreTestData = [
      {
        name: 'Michelin Pilot Sport 4',
        description: 'High-performance tyre for sports cars',
        price: 8500,
      },
      {
        name: 'Bridgestone Turanza T005',
        description: 'Premium touring tyre with excellent comfort',
        price: 7200,
      },
      {
        name: 'Continental PremiumContact 6',
        description: 'Superior braking performance in wet and dry',
        price: 6800,
      },
      {
        name: 'Pirelli P Zero',
        description: 'Ultra-high performance tyre for supercars',
        price: 12000,
      },
      {
        name: 'Goodyear Eagle F1 Asymmetric 5',
        description: 'Advanced asymmetric tread pattern',
        price: 9500,
      },
    ];

    for (
      let i = 0;
      i < Math.min(tyreTestData.length, tyreWidths.length, rimDiameters.length);
      i++
    ) {
      const tyreInfo = tyreTestData[i];

      const tyre = await TyreModel.create({
        created_by: testUser._id,
        tyreWidthType: 'MM',
        tyreWidth: tyreWidths[i]._id,
        rimDiameter: rimDiameters[i]._id,
        productDescription: tyreInfo.description,
        productImages: [
          `https://via.placeholder.com/400x400/2C3E50/FFFFFF?text=Tyre+${
            i + 1
          }`,
        ],
      });

      const product = await Product.create({
        product_category: 'TYRE',
        tyre: tyre._id,
        product_name: `${tyreInfo.name} - ${tyreWidths[i].name}/${rimDiameters[i].name}`,
        product_description: tyreInfo.description,
        brand: brands[i % brands.length]._id,
        vendor: vendors[i % vendors.length]._id,
        cost_price: Math.round(tyreInfo.price * 0.7),
        mrp_price: tyreInfo.price,
        rcp_price: tyreInfo.price,
        auto_deal_price: Math.round(tyreInfo.price * 0.85),
        stock_quantity: 25 + Math.floor(Math.random() * 30),
        product_images: tyre.productImages,
      });

      products.push(product);
      console.log(`   ✅ Created tyre: ${product.product_name}`);
    }

    // Step 4: Get alloy wheel supporting data
    console.log('⚙️ Getting alloy wheel supporting data...');

    const db = mongoose.connection.db;
    const alloyDiameters = await db
      .collection('alloydiameters')
      .find()
      .limit(3)
      .toArray();
    const alloyWidths = await db
      .collection('alloywidths')
      .find()
      .limit(3)
      .toArray();
    const alloyPCDs = await db
      .collection('alloypcds')
      .find()
      .limit(3)
      .toArray();
    const alloyOffsets = await db
      .collection('alloyoffsets')
      .find()
      .limit(3)
      .toArray();
    const alloyBoreSizes = await db
      .collection('alloyboresizes')
      .find()
      .limit(3)
      .toArray();
    const alloyFinishes = await db
      .collection('alloyfinishes')
      .find()
      .limit(3)
      .toArray();

    console.log(
      `   Alloy Diameters: ${alloyDiameters.length}, Widths: ${alloyWidths.length}`
    );
    console.log(
      `   PCDs: ${alloyPCDs.length}, Offsets: ${alloyOffsets.length}`
    );
    console.log(
      `   Bore Sizes: ${alloyBoreSizes.length}, Finishes: ${alloyFinishes.length}`
    );

    // Step 5: Create alloy wheel products if we have supporting data
    if (
      alloyDiameters.length > 0 &&
      alloyWidths.length > 0 &&
      alloyPCDs.length > 0 &&
      alloyOffsets.length > 0 &&
      alloyBoreSizes.length > 0 &&
      alloyFinishes.length > 0
    ) {
      console.log('⚙️ Creating alloy wheel products...');

      const wheelTestData = [
        {
          name: 'OZ Racing Ultraleggera HLT',
          description: 'Lightweight forged alloy wheel for track performance',
        },
        {
          name: 'BBS CH-R II',
          description: 'Premium multi-piece wheel with classic design',
        },
        {
          name: 'Enkei RPF1',
          description: 'Legendary lightweight racing wheel',
        },
      ];

      const maxWheels = Math.min(
        wheelTestData.length,
        alloyDiameters.length,
        alloyWidths.length,
        alloyPCDs.length,
        alloyOffsets.length,
        alloyBoreSizes.length,
        alloyFinishes.length
      );

      for (let i = 0; i < maxWheels; i++) {
        const wheelInfo = wheelTestData[i];

        const wheel = await AlloyWheel.create({
          created_by: testUser._id,
          alloyDiameterInches: new mongoose.Types.ObjectId(
            alloyDiameters[i % alloyDiameters.length]._id
          ),
          alloyWidth: new mongoose.Types.ObjectId(
            alloyWidths[i % alloyWidths.length]._id
          ),
          alloyPCD: new mongoose.Types.ObjectId(
            alloyPCDs[i % alloyPCDs.length]._id
          ),
          alloyOffset: new mongoose.Types.ObjectId(
            alloyOffsets[i % alloyOffsets.length]._id
          ),
          alloyBoreSizeMM: new mongoose.Types.ObjectId(
            alloyBoreSizes[i % alloyBoreSizes.length]._id
          ),
          alloyBrand: brands[i % brands.length]._id,
          alloyDesignName: wheelInfo.name,
          alloyFinish: new mongoose.Types.ObjectId(
            alloyFinishes[i % alloyFinishes.length]._id
          ),
          productDescription: wheelInfo.description,
          productImages: [
            `https://via.placeholder.com/400x400/34495E/FFFFFF?text=Wheel+${
              i + 1
            }`,
          ],
        });

        const product = await Product.create({
          product_category: 'ALLOY_WHEEL',
          alloy_wheel: wheel._id,
          product_name: wheelInfo.name,
          product_description: wheelInfo.description,
          brand: brands[(5 + i) % brands.length]._id,
          vendor: vendors[i % vendors.length]._id,
          cost_price: 15000 + i * 5000,
          mrp_price: 25000 + i * 8000,
          rcp_price: 25000 + i * 8000,
          auto_deal_price: 20000 + i * 6000,
          stock_quantity: 10 + Math.floor(Math.random() * 15),
          product_images: wheel.productImages,
        });

        products.push(product);
        console.log(`   ✅ Created alloy wheel: ${product.product_name}`);
      }
    } else {
      console.log('   ⚠️ Skipping alloy wheels - insufficient supporting data');
    }

    // Step 6: Get ProductType data
    console.log('🔧 Getting ProductType data...');
    const productTypes = await db
      .collection('producttypes')
      .find()
      .limit(5)
      .toArray();
    console.log(`   ProductTypes found: ${productTypes.length}`);

    // Step 7: Create service products
    console.log('🔧 Creating service products...');

    const serviceTestData = [
      {
        name: 'Tyre Installation & Balancing',
        short: 'TI',
        category: 'INSTALLATION',
        description:
          'Professional tyre installation with wheel balancing service',
        duration: 45,
        price: 800,
      },
      {
        name: '4-Wheel Alignment',
        short: 'WA',
        category: 'MAINTENANCE',
        description: 'Precision wheel alignment using laser technology',
        duration: 60,
        price: 1200,
      },
      {
        name: 'Brake Pad Replacement',
        short: 'BP',
        category: 'REPAIR',
        description: 'Complete brake pad replacement with inspection',
        duration: 90,
        price: 2500,
      },
      {
        name: 'Complete Vehicle Inspection',
        short: 'VI',
        category: 'INSPECTION',
        description: 'Comprehensive 50-point vehicle health inspection',
        duration: 120,
        price: 1500,
      },
      {
        name: 'Tyre Puncture Repair',
        short: 'PR',
        category: 'REPAIR',
        description: 'Professional tyre puncture repair service',
        duration: 30,
        price: 300,
      },
    ];

    for (let i = 0; i < serviceTestData.length; i++) {
      const serviceInfo = serviceTestData[i];

      const service = await Service.create({
        serviceName: serviceInfo.name,
        serviceDescription: serviceInfo.description,
        serviceShortName: serviceInfo.short,
        serviceCategory: serviceInfo.category,
        estimatedDuration: serviceInfo.duration,
        productType:
          productTypes.length > 0
            ? new mongoose.Types.ObjectId(
                productTypes[i % productTypes.length]._id
              )
            : undefined,
        created_by: testUser._id,
        published_status: 'PUBLISHED',
      });

      const product = await Product.create({
        product_category: 'SERVICE',
        service: service._id,
        product_name: serviceInfo.name,
        product_description: serviceInfo.description,
        brand: brands[(8 + (i % 2)) % brands.length]._id,
        vendor: vendors[i % vendors.length]._id,
        cost_price: Math.round(serviceInfo.price * 0.6),
        mrp_price: serviceInfo.price,
        rcp_price: serviceInfo.price,
        auto_deal_price: Math.round(serviceInfo.price * 0.8),
        stock_quantity: 999, // Services have unlimited stock
        product_images: [
          `https://via.placeholder.com/400x400/E74C3C/FFFFFF?text=Service+${
            i + 1
          }`,
        ],
      });

      products.push(product);
      console.log(`   ✅ Created service: ${product.product_name}`);
    }

    // Final Summary
    console.log('\n🎉 REAL TEST DATA CREATED SUCCESSFULLY!');
    console.log('===========================================');
    console.log(`✅ Total Products Created: ${products.length}`);

    const tyreCount = products.filter(
      (p) => p.product_category === 'TYRE'
    ).length;
    const wheelCount = products.filter(
      (p) => p.product_category === 'ALLOY_WHEEL'
    ).length;
    const serviceCount = products.filter(
      (p) => p.product_category === 'SERVICE'
    ).length;

    console.log(`   - 🚗 Tyres: ${tyreCount}`);
    console.log(`   - ⚙️ Alloy Wheels: ${wheelCount}`);
    console.log(`   - 🔧 Services: ${serviceCount}`);
    console.log('===========================================');
    console.log('🌐 READY FOR COMPREHENSIVE TESTING!');
    console.log('🔗 Test your multi-product system:');
    console.log('   - Homepage: http://localhost:3001/');
    console.log('   - Tyres Page: http://localhost:3001/tyres');
    console.log('   - Alloy Wheels: http://localhost:3001/alloy-wheels');
    console.log('   - Services: http://localhost:3001/services');
    console.log('   - Cart System: http://localhost:3001/cart');
    console.log('\n🚀 Test Flow:');
    console.log('   1. Browse products on each category page');
    console.log('   2. Add different product types to cart');
    console.log('   3. Check cart functionality');
    console.log('   4. Test complete checkout flow');
    console.log('\n✅ Your multi-product system is ready for REAL testing!');

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
  createRealTestData();
}
