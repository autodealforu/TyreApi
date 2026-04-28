import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all required models
import Product from './api/products/ProductModel.js';
import TyreModel from './api/tyres/TyreModel.js';
import AlloyWheel from './api/alloy-wheels/alloyWheelModel.js';
import Service from './api/services/ServiceModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import User from './api/users/UserModel.js';
import connectDB from './config/db.js';

// Import supporting models for tyres
import TyreWidth from './api/tyre-widths/tyreWidthModel.js';
import AspectRatio from './api/aspect-ratios/aspectRatioModel.js';
import RimDiameter from './api/rim-diameters/rimDiameterModel.js';
import LoadIndex from './api/load-indexes/loadIndexModel.js';
import SpeedSymbol from './api/speed-symbols/speedSymbolModel.js';
import ThreadPattern from './api/thread-patterns/threadPatternModel.js';

// Import supporting models for alloy wheels
import AlloyDiameter from './api/alloy-wheels/AlloyDiameterModel.js';
import AlloyWidth from './api/alloy-wheels/AlloyWidthModel.js';
import AlloyPCD from './api/alloy-wheels/AlloyPCDModel.js';
import AlloyOffset from './api/alloy-wheels/AlloyOffsetModel.js';
import AlloyFinish from './api/alloy-wheels/AlloyFinishModel.js';

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

const createSupportingData = async () => {
  try {
    console.log('🏗️  Creating supporting data...');

    // Create brands
    const brands = await Brand.insertMany([
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
    return brands;
  } catch (error) {
    console.error(`❌ Error creating supporting data: ${error}`);
    throw error;
  }
};

const createVendors = async () => {
  try {
    console.log('🏪 Creating vendors...');

    const vendors = await Vendor.insertMany([
      {
        name: 'Premium Tyre Store',
        username: 'vendor1',
        password: 'password123',
        phone: '9876543210',
        email: 'vendor1@example.com',
        store_name: 'Premium Tyre Store',
        store_description: 'Your trusted partner for premium tyres and wheels',
        vendor_address: 'Shop 123, Main Market, Delhi',
        vendor_city: 'Delhi',
        vendor_state: 'Delhi',
        vendor_pincode: '110001',
        vendor_status: 'Active',
      },
      {
        name: 'Wheel World',
        username: 'vendor2',
        password: 'password123',
        phone: '9876543211',
        email: 'vendor2@example.com',
        store_name: 'Wheel World',
        store_description:
          'Specialists in alloy wheels and automotive services',
        vendor_address: 'Shop 456, Auto Plaza, Mumbai',
        vendor_city: 'Mumbai',
        vendor_state: 'Maharashtra',
        vendor_pincode: '400001',
        vendor_status: 'Active',
      },
      {
        name: 'Auto Service Center',
        username: 'vendor3',
        password: 'password123',
        phone: '9876543212',
        email: 'vendor3@example.com',
        store_name: 'Auto Service Center',
        store_description: 'Complete automotive service solutions',
        vendor_address: 'Shop 789, Service Road, Bangalore',
        vendor_city: 'Bangalore',
        vendor_state: 'Karnataka',
        vendor_pincode: '560001',
        vendor_status: 'Active',
      },
    ]);

    console.log(`✅ Created ${vendors.length} vendors`);
    return vendors;
  } catch (error) {
    console.error(`❌ Error creating vendors: ${error}`);
    throw error;
  }
};

const createTyreProducts = async (brands, vendors) => {
  try {
    console.log('🚗 Creating tyre products...');

    const tyres = [];
    const products = [];

    // Create sample tyres
    const tyreData = [
      {
        tyre_name: 'Michelin Primacy 4',
        tyre_description:
          'Premium touring tyre with excellent wet grip and longevity',
        brand: brands.find((b) => b.name === 'Michelin')._id,
        vendor: vendors[0]._id,
        cost_price: 4000,
        mrp_price: 6000,
        auto_deal_price: 5200,
        stock_quantity: 50,
      },
      {
        tyre_name: 'Bridgestone Turanza T005',
        tyre_description: 'High-performance tyre for luxury sedans',
        brand: brands.find((b) => b.name === 'Bridgestone')._id,
        vendor: vendors[1]._id,
        cost_price: 3500,
        mrp_price: 5500,
        auto_deal_price: 4800,
        stock_quantity: 40,
      },
      {
        tyre_name: 'Continental ContiEcoContact 6',
        tyre_description: 'Eco-friendly tyre with low rolling resistance',
        brand: brands.find((b) => b.name === 'Continental')._id,
        vendor: vendors[0]._id,
        cost_price: 3800,
        mrp_price: 5800,
        auto_deal_price: 5000,
        stock_quantity: 35,
      },
      {
        tyre_name: 'Pirelli P7 Cinturato',
        tyre_description: 'Sport touring tyre with superior handling',
        brand: brands.find((b) => b.name === 'Pirelli')._id,
        vendor: vendors[1]._id,
        cost_price: 4200,
        mrp_price: 6200,
        auto_deal_price: 5400,
        stock_quantity: 30,
      },
      {
        tyre_name: 'Goodyear Assurance Triplemax 2',
        tyre_description: 'All-season tyre with enhanced safety features',
        brand: brands.find((b) => b.name === 'Goodyear')._id,
        vendor: vendors[2]._id,
        cost_price: 3200,
        mrp_price: 4800,
        auto_deal_price: 4200,
        stock_quantity: 60,
      },
    ];

    for (const tyreInfo of tyreData) {
      // Create tyre
      const tyre = await TyreModel.create({
        tyre_name: tyreInfo.tyre_name,
        tyre_description: tyreInfo.tyre_description,
        tyre_brand: tyreInfo.brand,
        construction: 'Radial',
        tyre_size: '215/55R17',
        product_images: [
          {
            image:
              'https://via.placeholder.com/400x400/000000/FFFFFF?text=Tyre1',
          },
          {
            image:
              'https://via.placeholder.com/400x400/333333/FFFFFF?text=Tyre2',
          },
        ],
      });

      // Create product
      const product = await Product.create({
        product_category: 'TYRE',
        tyre: tyre._id,
        product_name: tyreInfo.tyre_name,
        product_description: tyreInfo.tyre_description,
        brand: tyreInfo.brand,
        vendor: tyreInfo.vendor,
        cost_price: tyreInfo.cost_price,
        mrp_price: tyreInfo.mrp_price,
        rcp_price: tyreInfo.mrp_price,
        auto_deal_price: tyreInfo.auto_deal_price,
        stock_quantity: tyreInfo.stock_quantity,
        product_images: [
          'https://via.placeholder.com/400x400/000000/FFFFFF?text=Tyre+Product',
        ],
      });

      tyres.push(tyre);
      products.push(product);
    }

    console.log(`✅ Created ${tyres.length} tyre products`);
    return { tyres, products };
  } catch (error) {
    console.error(`❌ Error creating tyre products: ${error}`);
    throw error;
  }
};

const createAlloyWheelProducts = async (brands, vendors) => {
  try {
    console.log('⚙️ Creating alloy wheel products...');

    const alloyWheels = [];
    const products = [];

    const alloyWheelData = [
      {
        wheel_name: 'OZ Racing Ultraleggera',
        wheel_description: 'Lightweight racing wheels for performance cars',
        brand: brands.find((b) => b.name === 'OZ Racing')._id,
        vendor: vendors[0]._id,
        cost_price: 8000,
        mrp_price: 12000,
        auto_deal_price: 10500,
        stock_quantity: 20,
        diameter: '17',
        width: '7.5',
        pcd: '5x112',
        offset: '+45',
        finish: 'Matt Bronze',
      },
      {
        wheel_name: 'BBS CH-R',
        wheel_description: 'Classic design with modern technology',
        brand: brands.find((b) => b.name === 'BBS')._id,
        vendor: vendors[1]._id,
        cost_price: 15000,
        mrp_price: 22000,
        auto_deal_price: 19000,
        stock_quantity: 15,
        diameter: '18',
        width: '8.0',
        pcd: '5x120',
        offset: '+35',
        finish: 'Satin Black',
      },
      {
        wheel_name: 'Enkei RPF1',
        wheel_description: 'Legendary lightweight wheel for motorsports',
        brand: brands.find((b) => b.name === 'Enkei')._id,
        vendor: vendors[0]._id,
        cost_price: 12000,
        mrp_price: 18000,
        auto_deal_price: 15500,
        stock_quantity: 25,
        diameter: '17',
        width: '8.0',
        pcd: '5x114.3',
        offset: '+50',
        finish: 'Silver',
      },
      {
        wheel_name: 'OZ Racing Alleggerita',
        wheel_description: 'Track-focused lightweight alloy wheels',
        brand: brands.find((b) => b.name === 'OZ Racing')._id,
        vendor: vendors[2]._id,
        cost_price: 10000,
        mrp_price: 15000,
        auto_deal_price: 13000,
        stock_quantity: 18,
        diameter: '16',
        width: '7.0',
        pcd: '4x100',
        offset: '+40',
        finish: 'White',
      },
    ];

    for (const wheelInfo of alloyWheelData) {
      // Create alloy wheel
      const alloyWheel = await AlloyWheel.create({
        wheel_name: wheelInfo.wheel_name,
        wheel_description: wheelInfo.wheel_description,
        alloy_wheel_brand: wheelInfo.brand,
        diameter: wheelInfo.diameter,
        width: wheelInfo.width,
        pcd: wheelInfo.pcd,
        offset: wheelInfo.offset,
        finish: wheelInfo.finish,
        product_images: [
          {
            image:
              'https://via.placeholder.com/400x400/444444/FFFFFF?text=Wheel1',
          },
          {
            image:
              'https://via.placeholder.com/400x400/666666/FFFFFF?text=Wheel2',
          },
        ],
      });

      // Create product
      const product = await Product.create({
        product_category: 'ALLOY_WHEEL',
        alloy_wheel: alloyWheel._id,
        product_name: wheelInfo.wheel_name,
        product_description: wheelInfo.wheel_description,
        brand: wheelInfo.brand,
        vendor: wheelInfo.vendor,
        cost_price: wheelInfo.cost_price,
        mrp_price: wheelInfo.mrp_price,
        rcp_price: wheelInfo.mrp_price,
        auto_deal_price: wheelInfo.auto_deal_price,
        stock_quantity: wheelInfo.stock_quantity,
        product_images: [
          'https://via.placeholder.com/400x400/444444/FFFFFF?text=Alloy+Wheel',
        ],
      });

      alloyWheels.push(alloyWheel);
      products.push(product);
    }

    console.log(`✅ Created ${alloyWheels.length} alloy wheel products`);
    return { alloyWheels, products };
  } catch (error) {
    console.error(`❌ Error creating alloy wheel products: ${error}`);
    throw error;
  }
};

const createServiceProducts = async (brands, vendors) => {
  try {
    console.log('🔧 Creating service products...');

    const services = [];
    const products = [];

    const serviceData = [
      {
        service_name: 'Tyre Installation & Balancing',
        service_description:
          'Professional tyre installation with computerized wheel balancing',
        brand: brands.find((b) => b.name === 'Service Pro')._id,
        vendor: vendors[2]._id,
        cost_price: 200,
        mrp_price: 500,
        auto_deal_price: 400,
        stock_quantity: 999,
        service_type: 'Installation',
        estimated_time: '30-45 minutes',
        location_type: 'Workshop',
        includes:
          '["Tyre mounting", "Wheel balancing", "Valve replacement", "Basic inspection"]',
        warranty: '1 month',
      },
      {
        service_name: '4-Wheel Alignment',
        service_description:
          'Computerized wheel alignment for optimal tyre wear and handling',
        brand: brands.find((b) => b.name === 'Service Pro')._id,
        vendor: vendors[0]._id,
        cost_price: 800,
        mrp_price: 1500,
        auto_deal_price: 1200,
        stock_quantity: 999,
        service_type: 'Alignment',
        estimated_time: '45-60 minutes',
        location_type: 'Workshop',
        includes:
          '["Front alignment", "Rear alignment", "Camber adjustment", "Toe adjustment", "Test drive"]',
        warranty: '3 months',
      },
      {
        service_name: 'Brake Pad Replacement',
        service_description:
          'Complete brake pad replacement with brake fluid check',
        brand: brands.find((b) => b.name === 'QuickFix')._id,
        vendor: vendors[1]._id,
        cost_price: 1500,
        mrp_price: 2500,
        auto_deal_price: 2000,
        stock_quantity: 999,
        service_type: 'Repair',
        estimated_time: '60-90 minutes',
        location_type: 'Workshop',
        includes:
          '["Brake pad replacement", "Brake disc inspection", "Brake fluid check", "Safety test"]',
        warranty: '6 months',
      },
      {
        service_name: 'Complete Vehicle Inspection',
        service_description:
          'Comprehensive 50-point vehicle inspection and report',
        brand: brands.find((b) => b.name === 'Service Pro')._id,
        vendor: vendors[2]._id,
        cost_price: 500,
        mrp_price: 1000,
        auto_deal_price: 750,
        stock_quantity: 999,
        service_type: 'Inspection',
        estimated_time: '90-120 minutes',
        location_type: 'Workshop',
        includes:
          '["Engine inspection", "Brake system check", "Suspension check", "Battery test", "Detailed report"]',
        warranty: 'Report valid for 1 month',
      },
      {
        service_name: 'Mobile Tyre Fitting',
        service_description: 'Convenient tyre fitting service at your location',
        brand: brands.find((b) => b.name === 'QuickFix')._id,
        vendor: vendors[0]._id,
        cost_price: 300,
        mrp_price: 800,
        auto_deal_price: 600,
        stock_quantity: 999,
        service_type: 'Installation',
        estimated_time: '45-60 minutes',
        location_type: 'Mobile',
        includes:
          '["Mobile service", "Tyre installation", "Basic balancing", "Old tyre disposal"]',
        warranty: '1 month',
      },
    ];

    for (const serviceInfo of serviceData) {
      // Create service
      const service = await Service.create({
        service_name: serviceInfo.service_name,
        service_description: serviceInfo.service_description,
        service_brand: serviceInfo.brand,
        service_type: serviceInfo.service_type,
        estimated_time: serviceInfo.estimated_time,
        location_type: serviceInfo.location_type,
        includes: serviceInfo.includes,
        warranty: serviceInfo.warranty,
      });

      // Create product
      const product = await Product.create({
        product_category: 'SERVICE',
        service: service._id,
        product_name: serviceInfo.service_name,
        product_description: serviceInfo.service_description,
        brand: serviceInfo.brand,
        vendor: serviceInfo.vendor,
        cost_price: serviceInfo.cost_price,
        mrp_price: serviceInfo.mrp_price,
        rcp_price: serviceInfo.mrp_price,
        auto_deal_price: serviceInfo.auto_deal_price,
        stock_quantity: serviceInfo.stock_quantity,
        product_images: [
          'https://via.placeholder.com/400x400/888888/FFFFFF?text=Service',
        ],
      });

      services.push(service);
      products.push(product);
    }

    console.log(`✅ Created ${services.length} service products`);
    return { services, products };
  } catch (error) {
    console.error(`❌ Error creating service products: ${error}`);
    throw error;
  }
};

const importData = async () => {
  try {
    console.log('🚀 Starting comprehensive seeder for all product types...\n');

    // Step 1: Destroy existing data
    await destroyData();

    // Step 2: Create supporting data
    const brands = await createSupportingData();

    // Step 3: Create vendors
    const vendors = await createVendors();

    // Step 4: Create products for all types
    const { tyres, products: tyreProducts } = await createTyreProducts(
      brands,
      vendors
    );
    const { alloyWheels, products: wheelProducts } =
      await createAlloyWheelProducts(brands, vendors);
    const { services, products: serviceProducts } = await createServiceProducts(
      brands,
      vendors
    );

    // Summary
    console.log('\n🎉 SEEDER COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Vendors: ${vendors.length}`);
    console.log(`✅ Tyre Products: ${tyreProducts.length}`);
    console.log(`✅ Alloy Wheel Products: ${wheelProducts.length}`);
    console.log(`✅ Service Products: ${serviceProducts.length}`);
    console.log(
      `✅ Total Products: ${
        tyreProducts.length + wheelProducts.length + serviceProducts.length
      }`
    );
    console.log('=====================================');
    console.log('🌐 You can now test the multi-product system!');

    process.exit();
  } catch (error) {
    console.error(`❌ Seeder failed: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData().then(() => {
    console.log('✅ Data destroyed successfully!');
    process.exit();
  });
} else {
  importData();
}
