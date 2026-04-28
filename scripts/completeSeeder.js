import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models
import TyreModel from '../api/tyres/TyreModel.js';
import Product from '../api/products/ProductModel.js';
import RimDiameter from '../api/rim-diameters/rimDiameterModel.js';
import TyreWidth from '../api/tyre-widths/tyreWidthModel.js';
import AspectRatio from '../api/aspect-ratios/aspectRatioModel.js';
import LoadIndex from '../api/load-indexes/loadIndexModel.js';
import SpeedSymbol from '../api/speed-symbols/speedSymbolModel.js';
import PlyRating from '../api/plyratings/plyRatingModel.js';
import Brand from '../api/brands/BrandModel.js';
import ThreadPattern from '../api/thread-patterns/threadPatternModel.js';
import ProductType from '../api/product-types/productTypeModel.js';
import User from '../api/users/UserModel.js';
import Vehicle from '../api/vehicles/VehicleModel.js';
import Service from '../api/services/ServiceModel.js';
import Technician from '../api/technicians/TechniciansModel.js';
import Part from '../api/parts/PartModel.js';
import JobCard from '../api/jobcards/JobCardModel.js';

import connectDB from '../config/db.js';

// Configure environment variables
dotenv.config();

// Sample reference data
const sampleData = {
  rimDiameters: [
    { name: '13"' },
    { name: '14"' },
    { name: '15"' },
    { name: '16"' },
    { name: '17"' },
    { name: '18"' },
  ],

  tyreWidths: [
    { name: '175', width_type: 'MM' },
    { name: '185', width_type: 'MM' },
    { name: '195', width_type: 'MM' },
    { name: '205', width_type: 'MM' },
    { name: '215', width_type: 'MM' },
    { name: '225', width_type: 'MM' },
  ],

  aspectRatios: [
    { name: '65%' },
    { name: '70%' },
    { name: '75%' },
    { name: '80%' },
    { name: '55%' },
    { name: '60%' },
  ],

  loadIndexes: [
    { name: '87' },
    { name: '91' },
    { name: '94' },
    { name: '97' },
    { name: '100' },
    { name: '103' },
  ],

  speedSymbols: [
    { name: 'H' },
    { name: 'V' },
    { name: 'W' },
    { name: 'T' },
    { name: 'S' },
    { name: 'R' },
  ],

  plyRatings: [
    { name: '4PR' },
    { name: '6PR' },
    { name: '8PR' },
    { name: '10PR' },
  ],

  brands: [
    { name: 'MRF' },
    { name: 'CEAT' },
    { name: 'Apollo' },
    { name: 'JK Tyre' },
    { name: 'Michelin' },
    { name: 'Bridgestone' },
  ],

  threadPatterns: [
    { name: 'Highway' },
    { name: 'All-Terrain' },
    { name: 'Performance' },
    { name: 'Touring' },
    { name: 'Urban' },
    { name: 'Sport' },
  ],

  productTypes: [
    { name: 'Passenger' },
    { name: 'SUV' },
    { name: 'Commercial' },
    { name: 'Motorcycle' },
  ],
};

// Helper functions to generate test data
const generateTestCustomer = () => {
  return {
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '9876543210',
    username: 'customer@test.com',
    password: 'password123', // Let the model hash this
    role: 'CUSTOMER',
    address: [
      {
        address_1: '123 Test Street',
        address_2: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        pin: '123456',
        landmark: 'Near Test Mall',
      },
    ],
    published_status: 'PUBLISHED',
  };
};

const generateTestVendor = () => {
  return {
    name: 'Test Vendor',
    email: 'vendor@test.com',
    phone: '9876543211',
    username: 'vendor@test.com',
    password: 'vendor123', // Let the model hash this
    role: 'VENDOR',
    vendor: {
      store_name: 'Test Auto Parts Store',
      store_description: 'Complete automotive solution provider',
      gst_no: 'GST123456789',
      pan_no: 'ABCDE1234F',
      profile_status: 'APPROVED',
      store_active: true,
      pickup_address: [
        {
          address_1: '456 Vendor Street',
          city: 'Vendor City',
          state: 'Vendor State',
          pin: '654321',
        },
      ],
    },
    published_status: 'PUBLISHED',
  };
};

const generateTestVehicles = (customerId) => {
  return [
    {
      make: 'Maruti Suzuki',
      model: 'Swift',
      year: 2020,
      vin: 'JTDKN3DU4A0123456',
      vehicle_number: 'DL01AB1234',
      owner: customerId,
    },
    {
      make: 'Hyundai',
      model: 'i20',
      year: 2019,
      vin: 'KMHD14LA5KA123456',
      vehicle_number: 'DL01CD5678',
      owner: customerId,
    },
  ];
};

const generateTestServices = (vendorId) => {
  return [
    {
      service_name: 'Oil Change',
      service_description: 'Complete engine oil change with filter replacement',
      service_short_name: 'Oil Change',
      gst_tax_rate: '18%',
      gst_type: '18',
      unit: 'Service',
      hsn_code: '99831',
      service_cost: 800,
      service_price_mrp: 1000,
      service_price_rcp: 900,
      vendor: vendorId,
    },
    {
      service_name: 'Tyre Rotation',
      service_description: 'Professional tyre rotation and balancing service',
      service_short_name: 'Tyre Rotation',
      gst_tax_rate: '18%',
      gst_type: '18',
      unit: 'Service',
      hsn_code: '99832',
      service_cost: 500,
      service_price_mrp: 600,
      service_price_rcp: 550,
      vendor: vendorId,
    },
    {
      service_name: 'Brake Inspection',
      service_description: 'Complete brake system inspection and adjustment',
      service_short_name: 'Brake Check',
      gst_tax_rate: '18%',
      gst_type: '18',
      unit: 'Service',
      hsn_code: '99833',
      service_cost: 300,
      service_price_mrp: 400,
      service_price_rcp: 350,
      vendor: vendorId,
    },
  ];
};

const generateTestTechnicians = (vendorId) => {
  return [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh@vendor.com',
      phone: '9876543212',
      specialization: 'Engine Specialist',
      vendor: vendorId,
    },
    {
      name: 'Amit Singh',
      email: 'amit@vendor.com',
      phone: '9876543213',
      specialization: 'Tyre & Brake Specialist',
      vendor: vendorId,
    },
  ];
};

const generateTestParts = (vendorId) => {
  return [
    {
      name: 'Engine Oil Filter',
      description: 'High quality engine oil filter for optimal performance',
      price: 200,
      gst_tax_rate: '18%',
      gst_type: '18',
      vendor: vendorId,
    },
    {
      name: 'Brake Pad Set',
      description: 'Premium brake pad set for enhanced stopping power',
      price: 1500,
      gst_tax_rate: '18%',
      gst_type: '18',
      vendor: vendorId,
    },
    {
      name: 'Air Filter',
      description: 'OEM quality air filter for clean air intake',
      price: 300,
      gst_tax_rate: '18%',
      gst_type: '18',
      vendor: vendorId,
    },
  ];
};

const generateTestJobCards = (
  customerId,
  vendorId,
  vehicleIds,
  serviceIds,
  technicianIds,
  partIds,
  productIds
) => {
  const jobCards = [];

  // Job Card 1 - Oil Change Service
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[0],
    service_type: 'Maintenance',
    service_description:
      'Regular maintenance - Oil change and filter replacement',
    service_date: new Date('2024-01-15'),
    service_status: 'Completed',
    service_notes:
      'Customer requested premium oil. Service completed without issues.',
    service_technician: technicianIds[0],
    services_used: [
      {
        service_id: serviceIds[0],
        service_name: 'Oil Change',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 800,
        service_total_cost: 944, // 800 + 18% tax
      },
    ],
    products_used: [
      {
        product_id: productIds[0],
        product_name: 'Premium Engine Oil',
        product_cost: 500,
        product_quantity: 1,
        product_total_cost: 590,
        product_discount: 0,
        product_discount_type: 'FLAT',
        product_tax: 18,
      },
    ],
    service_parts_used: [
      {
        part_id: partIds[0],
        part_name: 'Engine Oil Filter',
        part_cost: 200,
        part_quantity: 1,
        part_total_cost: 236,
        part_discount: 0,
        part_discount_type: 'FLAT',
        part_tax: 18,
      },
    ],
    service_labor_cost: 300,
    service_total_cost: 1770,
    service_payment_status: 'Paid',
    service_payment_method: 'UPI',
    service_payment_date: new Date('2024-01-15'),
    service_feedback: 'Excellent service, very professional staff',
    service_rating: 5,
  });

  // Job Card 2 - Tyre Service
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[1],
    service_type: 'Maintenance',
    service_description: 'Tyre rotation and balancing service',
    service_date: new Date('2024-02-01'),
    service_status: 'Completed',
    service_notes: 'All tyres rotated as per schedule. Balancing done.',
    service_technician: technicianIds[1],
    services_used: [
      {
        service_id: serviceIds[1],
        service_name: 'Tyre Rotation',
        service_discount: 50,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 500,
        service_total_cost: 531, // (500-50) + 18% tax
      },
    ],
    products_used: [],
    service_parts_used: [],
    service_labor_cost: 200,
    service_total_cost: 731,
    service_payment_status: 'Paid',
    service_payment_method: 'Cash',
    service_payment_date: new Date('2024-02-01'),
    service_feedback: 'Good service, completed on time',
    service_rating: 4,
  });

  // Job Card 3 - Brake Service
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[0],
    service_type: 'Repair',
    service_description: 'Brake pad replacement and system inspection',
    service_date: new Date('2024-02-15'),
    service_status: 'Completed',
    service_notes: 'Front brake pads were worn out. Replaced with new ones.',
    service_technician: technicianIds[1],
    services_used: [
      {
        service_id: serviceIds[2],
        service_name: 'Brake Inspection',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 300,
        service_total_cost: 354,
      },
    ],
    products_used: [],
    service_parts_used: [
      {
        part_id: partIds[1],
        part_name: 'Brake Pad Set',
        part_cost: 1500,
        part_quantity: 1,
        part_total_cost: 1770,
        part_discount: 0,
        part_discount_type: 'FLAT',
        part_tax: 18,
      },
    ],
    service_labor_cost: 500,
    service_total_cost: 2624,
    service_payment_status: 'Paid',
    service_payment_method: 'Credit Card',
    service_payment_date: new Date('2024-02-15'),
    service_feedback: 'Great work, brakes feel much better now',
    service_rating: 5,
  });

  // Job Card 4 - Comprehensive Service
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[0],
    service_type: 'Maintenance',
    service_description:
      'Complete vehicle service - Oil, filters, and inspection',
    service_date: new Date('2024-03-01'),
    service_status: 'In Progress',
    service_notes:
      'Comprehensive service in progress. Oil changed, working on filters.',
    service_technician: technicianIds[0],
    services_used: [
      {
        service_id: serviceIds[0],
        service_name: 'Oil Change',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 800,
        service_total_cost: 944,
      },
      {
        service_id: serviceIds[2],
        service_name: 'Brake Inspection',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 300,
        service_total_cost: 354,
      },
    ],
    products_used: [
      {
        product_id: productIds[0],
        product_name: 'Premium Engine Oil',
        product_cost: 500,
        product_quantity: 1,
        product_total_cost: 590,
        product_discount: 0,
        product_discount_type: 'FLAT',
        product_tax: 18,
      },
    ],
    service_parts_used: [
      {
        part_id: partIds[0],
        part_name: 'Engine Oil Filter',
        part_cost: 200,
        part_quantity: 1,
        part_total_cost: 236,
        part_discount: 0,
        part_discount_type: 'FLAT',
        part_tax: 18,
      },
      {
        part_id: partIds[2],
        part_name: 'Air Filter',
        part_cost: 300,
        part_quantity: 1,
        part_total_cost: 354,
        part_discount: 0,
        part_discount_type: 'FLAT',
        part_tax: 18,
      },
    ],
    service_labor_cost: 800,
    service_total_cost: 3278,
    service_payment_status: 'Unpaid',
    // service_payment_method omitted for unpaid status
    // service_payment_date omitted for unpaid status
  });

  // Job Card 5 - Future Service
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[1],
    service_type: 'Inspection',
    service_description: 'Scheduled vehicle inspection and maintenance check',
    service_date: new Date('2024-03-20'),
    service_status: 'Pending',
    service_notes: 'Scheduled for comprehensive inspection next week.',
    service_technician: technicianIds[0],
    services_used: [
      {
        service_id: serviceIds[2],
        service_name: 'Brake Inspection',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 300,
        service_total_cost: 354,
      },
    ],
    products_used: [],
    service_parts_used: [],
    service_labor_cost: 200,
    service_total_cost: 554,
    service_payment_status: 'Unpaid',
    // service_payment_method omitted for unpaid status
    // service_payment_date omitted for unpaid status
  });

  // Job Card 6 - Emergency Repair
  jobCards.push({
    customer: customerId,
    vendor: vendorId,
    vehicle: vehicleIds[0],
    service_type: 'Repair',
    service_description: 'Emergency brake repair - urgent safety issue',
    service_date: new Date('2024-01-28'),
    service_status: 'Completed',
    service_notes:
      'Emergency repair completed. Customer was driving with faulty brakes.',
    service_technician: technicianIds[1],
    services_used: [
      {
        service_id: serviceIds[2],
        service_name: 'Brake Inspection',
        service_discount: 0,
        service_discount_type: 'FLAT',
        service_tax: 18,
        service_quantity: 1,
        service_cost: 300,
        service_total_cost: 354,
      },
    ],
    products_used: [],
    service_parts_used: [
      {
        part_id: partIds[1],
        part_name: 'Brake Pad Set',
        part_cost: 1500,
        part_quantity: 2, // Both front and rear
        part_total_cost: 3540,
        part_discount: 100,
        part_discount_type: 'FLAT',
        part_tax: 18,
      },
    ],
    service_labor_cost: 600,
    service_total_cost: 4494,
    service_payment_status: 'Paid',
    service_payment_method: 'Bank Transfer',
    service_payment_date: new Date('2024-01-29'),
    service_feedback: 'Life saver! Fixed the issue immediately',
    service_rating: 5,
  });

  return jobCards;
};

// Main seeding function
const seedCompleteDatabase = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🗑️ Clearing existing data...');
    // Clear all existing data
    await Promise.all([
      TyreModel.deleteMany({}),
      Product.deleteMany({}),
      RimDiameter.deleteMany({}),
      TyreWidth.deleteMany({}),
      AspectRatio.deleteMany({}),
      LoadIndex.deleteMany({}),
      SpeedSymbol.deleteMany({}),
      PlyRating.deleteMany({}),
      Brand.deleteMany({}),
      ThreadPattern.deleteMany({}),
      ProductType.deleteMany({}),
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Service.deleteMany({}),
      Technician.deleteMany({}),
      Part.deleteMany({}),
      JobCard.deleteMany({}),
    ]);

    console.log('📊 Creating reference data...');
    // Create reference data
    const [
      createdRimDiameters,
      createdTyreWidths,
      createdAspectRatios,
      createdLoadIndexes,
      createdSpeedSymbols,
      createdPlyRatings,
      createdBrands,
      createdThreadPatterns,
      createdProductTypes,
    ] = await Promise.all([
      RimDiameter.insertMany(sampleData.rimDiameters),
      TyreWidth.insertMany(sampleData.tyreWidths),
      AspectRatio.insertMany(sampleData.aspectRatios),
      LoadIndex.insertMany(sampleData.loadIndexes),
      SpeedSymbol.insertMany(sampleData.speedSymbols),
      PlyRating.insertMany(sampleData.plyRatings),
      Brand.insertMany(sampleData.brands),
      ThreadPattern.insertMany(sampleData.threadPatterns),
      ProductType.insertMany(sampleData.productTypes),
    ]);

    console.log('👥 Creating test users...');
    // Create test customer and vendor
    const customerData = generateTestCustomer();
    const vendorData = generateTestVendor();

    const [testCustomer, testVendor] = await Promise.all([
      User.create(customerData),
      User.create(vendorData),
    ]);

    console.log('🚗 Creating test vehicles...');
    // Create test vehicles
    const vehicleData = generateTestVehicles(testCustomer._id);
    const createdVehicles = await Vehicle.insertMany(vehicleData);

    console.log('🔧 Creating test services...');
    // Create test services
    const serviceData = generateTestServices(testVendor._id);
    const createdServices = await Service.insertMany(serviceData);

    console.log('👨‍🔧 Creating test technicians...');
    // Create test technicians
    const technicianData = generateTestTechnicians(testVendor._id);
    const createdTechnicians = await Technician.insertMany(technicianData);

    console.log('🔩 Creating test parts...');
    // Create test parts
    const partData = generateTestParts(testVendor._id);
    const createdParts = await Part.insertMany(partData);

    console.log('🏭 Creating 10 test tyres...');
    // Create 10 test tyres
    const testTyres = [];
    for (let i = 0; i < 10; i++) {
      const tyre = {
        rimDiameter: createdRimDiameters[i % createdRimDiameters.length]._id,
        tyreWidthType:
          createdTyreWidths[i % createdTyreWidths.length].name + 'mm',
        tyreWidth: createdTyreWidths[i % createdTyreWidths.length]._id,
        aspectRatio: createdAspectRatios[i % createdAspectRatios.length]._id,
        loadIndex: createdLoadIndexes[i % createdLoadIndexes.length]._id,
        speedSymbol: createdSpeedSymbols[i % createdSpeedSymbols.length]._id,
        construction: 'Radial',
        plyRating: createdPlyRatings[i % createdPlyRatings.length]._id,
        productBrand: createdBrands[i % createdBrands.length]._id,
        productThreadPattern:
          createdThreadPatterns[i % createdThreadPatterns.length]._id,
        productType: createdProductTypes[i % createdProductTypes.length]._id,
        gstTaxRate: '18%',
        gstTax: '18',
        unit: 'Piece',
        broadCategory: 'Automotive',
        category: 'Tyres',
        subCategory: createdProductTypes[i % createdProductTypes.length].name,
        hsnCode: '40111000',
        hsnSubCode: '4011100' + (i + 1),
        warranty: '2 Years',
        productImages: [
          `https://picsum.photos/400/400?random=${i + 1}`,
          `https://picsum.photos/400/400?random=${i + 10}`,
          `https://picsum.photos/400/400?random=${i + 20}`,
        ],
        productDescription: `High-quality ${createdThreadPatterns[
          i % createdThreadPatterns.length
        ].name.toLowerCase()} tyre from ${
          createdBrands[i % createdBrands.length].name
        }. Perfect for ${createdProductTypes[
          i % createdProductTypes.length
        ].name.toLowerCase()} vehicles.`,
        productWarrantyPolicy: `This ${
          createdBrands[i % createdBrands.length].name
        } tyre comes with a comprehensive 2-year warranty covering manufacturing defects.`,
        grossWeight: (Math.random() * 10 + 8).toFixed(2) + ' kg',
        volumetricWeight: (Math.random() * 15 + 10).toFixed(2) + ' kg',
        created_by: testVendor._id,
        published_status: 'PUBLISHED',
      };
      testTyres.push(tyre);
    }
    const createdTyres = await TyreModel.insertMany(testTyres);

    console.log('🛍️ Creating 10 test products...');
    // Create 10 test products
    const testProducts = [];
    for (let i = 0; i < 10; i++) {
      const product = {
        product_status: 'Active',
        tyre: createdTyres[i]._id,
        tyre_cost: 2000 + i * 100,
        tyre_price_mrp: 3000 + i * 150,
        tyre_price_rcp: 2500 + i * 125,
        tyre_price_auto_deal: 2200 + i * 110,
        in_stock: true,
        stock: 50 + i * 5,
        vendor: testVendor._id,
        created_by: testVendor._id,
        published_status: 'PUBLISHED',
      };
      testProducts.push(product);
    }
    const createdProducts = await Product.insertMany(testProducts);

    console.log('📋 Creating 6 test job cards...');
    // Create test job cards one by one to avoid auto-increment conflicts
    const jobCardData = generateTestJobCards(
      testCustomer._id,
      testVendor._id,
      createdVehicles.map((v) => v._id),
      createdServices.map((s) => s._id),
      createdTechnicians.map((t) => t._id),
      createdParts.map((p) => p._id),
      createdProducts.map((p) => p._id)
    );

    const createdJobCards = [];
    for (const jobCard of jobCardData) {
      try {
        const newJobCard = await JobCard.create(jobCard);
        createdJobCards.push(newJobCard);
        console.log(
          `   ✅ Created job card: ${newJobCard.service_description}`
        );
      } catch (error) {
        console.log(`   ❌ Failed to create job card: ${error.message}`);
      }
    }

    console.log('✅ Database seeding completed successfully!');

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   📏 Rim Diameters: ${createdRimDiameters.length}`);
    console.log(`   📐 Tyre Widths: ${createdTyreWidths.length}`);
    console.log(`   📊 Aspect Ratios: ${createdAspectRatios.length}`);
    console.log(`   ⚖️  Load Indexes: ${createdLoadIndexes.length}`);
    console.log(`   🏎️  Speed Symbols: ${createdSpeedSymbols.length}`);
    console.log(`   🔧 Ply Ratings: ${createdPlyRatings.length}`);
    console.log(`   🏭 Brands: ${createdBrands.length}`);
    console.log(`   🧵 Thread Patterns: ${createdThreadPatterns.length}`);
    console.log(`   📦 Product Types: ${createdProductTypes.length}`);
    console.log(`   🛞 Tyres: ${createdTyres.length}`);
    console.log(`   🛍️  Products: ${createdProducts.length}`);
    console.log(`   👥 Users: 2 (1 customer, 1 vendor)`);
    console.log(`   🚗 Vehicles: ${createdVehicles.length}`);
    console.log(`   🔧 Services: ${createdServices.length}`);
    console.log(`   👨‍🔧 Technicians: ${createdTechnicians.length}`);
    console.log(`   🔩 Parts: ${createdParts.length}`);
    console.log(`   📋 Job Cards: ${createdJobCards.length}`);

    console.log('\n👤 Test Account Details:');
    console.log(`   Customer: customer@test.com / password123`);
    console.log(`   Vendor: vendor@test.com / vendor123`);
    console.log(`   Phone: Customer - 9876543210, Vendor - 9876543211`);

    console.log('\n🚗 Test Vehicles:');
    createdVehicles.forEach((vehicle, index) => {
      console.log(
        `   ${index + 1}. ${vehicle.make} ${vehicle.model} (${
          vehicle.vehicle_number
        })`
      );
    });

    console.log('\n📋 Test Job Cards:');
    createdJobCards.forEach((jobCard, index) => {
      console.log(
        `   ${index + 1}. ${jobCard.service_description} - ${
          jobCard.service_status
        } (₹${jobCard.service_total_cost})`
      );
    });

    console.log('\n🎯 Next Steps:');
    console.log('   1. Test customer login with above credentials');
    console.log('   2. Test vendor login and job card management');
    console.log('   3. Test job card creation, update, and deletion');
    console.log('   4. Test product and tyre API endpoints');
    console.log('   5. Test search and filtering functionality');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Execute the seeder
console.log('🌱 Starting Complete Test Data Generator...');
console.log('📅 Generated on:', new Date().toLocaleString());
console.log('🎯 Target: Complete test environment with job cards\n');

seedCompleteDatabase();
