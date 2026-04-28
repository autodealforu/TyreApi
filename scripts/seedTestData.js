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

import connectDB from '../config/db.js';

// Configure environment variables
dotenv.config();

// Sample data for seeding
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
    { name: '91' },
    { name: '94' },
    { name: '97' },
    { name: '100' },
    { name: '103' },
    { name: '106' },
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

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🗑️ Clearing existing data...');

    // Clear existing data
    await TyreModel.deleteMany({});
    await Product.deleteMany({});
    await RimDiameter.deleteMany({});
    await TyreWidth.deleteMany({});
    await AspectRatio.deleteMany({});
    await LoadIndex.deleteMany({});
    await SpeedSymbol.deleteMany({});
    await PlyRating.deleteMany({});
    await Brand.deleteMany({});
    await ThreadPattern.deleteMany({});
    await ProductType.deleteMany({});

    console.log('📊 Creating reference data...');

    // Create reference data and store the created documents
    const createdRimDiameters = await RimDiameter.insertMany(
      sampleData.rimDiameters
    );
    const createdTyreWidths = await TyreWidth.insertMany(sampleData.tyreWidths);
    const createdAspectRatios = await AspectRatio.insertMany(
      sampleData.aspectRatios
    );
    const createdLoadIndexes = await LoadIndex.insertMany(
      sampleData.loadIndexes
    );
    const createdSpeedSymbols = await SpeedSymbol.insertMany(
      sampleData.speedSymbols
    );
    const createdPlyRatings = await PlyRating.insertMany(sampleData.plyRatings);
    const createdBrands = await Brand.insertMany(sampleData.brands);
    const createdThreadPatterns = await ThreadPattern.insertMany(
      sampleData.threadPatterns
    );
    const createdProductTypes = await ProductType.insertMany(
      sampleData.productTypes
    );

    console.log('✅ Reference data created successfully!');

    // Create a dummy user ID for created_by field (you can replace this with actual user ID)
    const dummyUserId = new mongoose.Types.ObjectId();

    console.log('🏭 Creating 10 test tyres...');

    // Create 10 test tyres with proper references
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

        // Additional fields
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
        ].name.toLowerCase()} vehicles. Size: ${
          createdTyreWidths[i % createdTyreWidths.length].name
        }/${createdAspectRatios[i % createdAspectRatios.length].name.replace(
          '%',
          ''
        )}R${createdRimDiameters[i % createdRimDiameters.length].name.replace(
          '"',
          ''
        )}`,

        productWarrantyPolicy: `This ${
          createdBrands[i % createdBrands.length].name
        } tyre comes with a comprehensive 2-year warranty covering manufacturing defects. Warranty includes free replacement for defects in materials and workmanship.`,

        grossWeight: (Math.random() * 10 + 8).toFixed(2) + ' kg',
        volumetricWeight: (Math.random() * 15 + 10).toFixed(2) + ' kg',

        created_by: dummyUserId,
        published_status: 'PUBLISHED',
      };

      testTyres.push(tyre);
    }

    const createdTyres = await TyreModel.insertMany(testTyres);
    console.log(`✅ Successfully created ${createdTyres.length} test tyres!`);

    console.log('🛍️ Creating 10 test products...');

    // Create 10 test products linked to the tyres
    const testProducts = [];
    for (let i = 0; i < 10; i++) {
      const baseCost = Math.floor(Math.random() * 8000) + 2000; // 2000-10000

      const product = {
        product_status: 'Active',
        tyre: createdTyres[i]._id,
        tyre_cost: baseCost,
        tyre_price_mrp: baseCost + 1000,
        tyre_price_rcp: baseCost + 500,
        tyre_price_auto_deal: baseCost + 200,
        in_stock: true,
        stock: Math.floor(Math.random() * 100) + 10, // 10-110 pieces
        vendor: dummyUserId,
        published_date: new Date(),
        created_by: dummyUserId,
        published_status: 'PUBLISHED',
      };

      testProducts.push(product);
    }

    const createdProducts = await Product.insertMany(testProducts);
    console.log(
      `✅ Successfully created ${createdProducts.length} test products!`
    );

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   Rim Diameters: ${createdRimDiameters.length}`);
    console.log(`   Tyre Widths: ${createdTyreWidths.length}`);
    console.log(`   Aspect Ratios: ${createdAspectRatios.length}`);
    console.log(`   Load Indexes: ${createdLoadIndexes.length}`);
    console.log(`   Speed Symbols: ${createdSpeedSymbols.length}`);
    console.log(`   Ply Ratings: ${createdPlyRatings.length}`);
    console.log(`   Brands: ${createdBrands.length}`);
    console.log(`   Thread Patterns: ${createdThreadPatterns.length}`);
    console.log(`   Product Types: ${createdProductTypes.length}`);
    console.log(`   Tyres: ${createdTyres.length}`);
    console.log(`   Products: ${createdProducts.length}`);

    console.log('\n📋 Sample tyres created:');
    createdTyres.slice(0, 5).forEach((tyre, index) => {
      console.log(
        `   ${index + 1}. ${tyre.tyreWidthType} ${tyre.subCategory} - HSN: ${
          tyre.hsnCode
        }`
      );
    });

    console.log('\n📋 Sample products created:');
    createdProducts.slice(0, 5).forEach((product, index) => {
      console.log(
        `   ${index + 1}. Cost: ₹${product.tyre_cost} | MRP: ₹${
          product.tyre_price_mrp
        } | Stock: ${product.stock}`
      );
    });

    console.log('\n🎯 Seeding completed successfully!');
    console.log('🚀 You can now test your API endpoints with this data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Execute the seeder
console.log('🌱 Starting Database Seeder...');
console.log('📅 Generated on:', new Date().toLocaleString());
console.log('🎯 Target: 10 tyres + 10 products + reference data\n');

seedDatabase();
