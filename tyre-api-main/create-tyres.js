// Simple script to create tyre products for multi-vendor testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from './api/products/ProductModel.js';
import TyreModel from './api/tyres/TyreModel.js';
import AlloyWheel from './api/alloy-wheels/alloyWheelModel.js';
import Service from './api/services/ServiceModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import User from './api/users/UserModel.js';
import TyreWidth from './api/tyre-widths/tyreWidthModel.js';
import RimDiameter from './api/rim-diameters/rimDiameterModel.js';
import ProductType from './api/product-types/productTypeModel.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const createTyreProducts = async () => {
  try {
    console.log('🚀 Creating tyre products for multi-vendor testing...');

    // Get existing supporting data
    const testUser = await User.findOne();
    const brands = await Brand.find().limit(10);
    const vendors = await Vendor.find().limit(3);
    const tyreWidths = await TyreWidth.find().limit(5);
    const rimDiameters = await RimDiameter.find().limit(5);

    if (!testUser) {
      console.log('❌ No user found. Please run the main seeder first.');
      process.exit(1);
    }

    if (tyreWidths.length === 0 || rimDiameters.length === 0) {
      console.log(
        '❌ Missing tyre supporting data. Please run the main seeder first.'
      );
      process.exit(1);
    }

    console.log(
      `✅ Found ${tyreWidths.length} tyre widths and ${rimDiameters.length} rim diameters`
    );
    console.log(
      `✅ Found ${brands.length} brands and ${vendors.length} vendors`
    );

    // Create tyre products
    const tyreData = [
      {
        name: 'High-Performance Summer Tyre',
        description: 'Premium summer tyre for sports cars',
        images: [
          'https://via.placeholder.com/400x400/2C3E50/FFFFFF?text=Tyre+1',
        ],
      },
      {
        name: 'All-Season Touring Tyre',
        description: 'Comfortable all-season tyre for sedans',
        images: [
          'https://via.placeholder.com/400x400/34495E/FFFFFF?text=Tyre+2',
        ],
      },
      {
        name: 'Winter Performance Tyre',
        description: 'Superior winter grip and handling',
        images: [
          'https://via.placeholder.com/400x400/2C3E50/FFFFFF?text=Tyre+3',
        ],
      },
      {
        name: 'Ultra-High Performance Tyre',
        description: 'Track-ready performance tyre',
        images: [
          'https://via.placeholder.com/400x400/1ABC9C/FFFFFF?text=Tyre+4',
        ],
      },
      {
        name: 'Eco-Friendly Touring Tyre',
        description: 'Low rolling resistance for fuel efficiency',
        images: [
          'https://via.placeholder.com/400x400/3498DB/FFFFFF?text=Tyre+5',
        ],
      },
    ];

    let products = [];

    for (let i = 0; i < tyreData.length; i++) {
      const tyreInfo = tyreData[i];

      // Create tyre specification
      const tyre = await TyreModel.create({
        productImages: tyreInfo.images,
        productDescription: tyreInfo.description,
        published_status: 'PUBLISHED',
        created_by: testUser._id,
        tyreWidthType: 'MM',
        tyreWidth: [tyreWidths[i % tyreWidths.length]._id],
        rimDiameter: [rimDiameters[i % rimDiameters.length]._id],
      });

      // Create product linking to tyre
      const product = await Product.create({
        product_category: 'TYRE',
        tyre: tyre._id,
        product_name: tyreInfo.name,
        product_description: tyreInfo.description,
        brand: brands[i % brands.length]._id,
        vendor: vendors[i % vendors.length]._id,
        cost_price: 3000 + i * 500,
        mrp_price: 5000 + i * 1000,
        rcp_price: 5000 + i * 1000,
        auto_deal_price: 4000 + i * 500,
        stock_quantity: 50 - i * 5,
        product_images: tyreInfo.images,
        published_status: 'PUBLISHED',
        product_status: 'Active',
        in_stock: true,
        published_date: new Date(),
      });

      products.push(product);
      console.log(`✅ Created tyre product: ${product.product_name}`);
    }

    // Create a duplicate tyre with different vendor to test multi-vendor functionality
    console.log('🔄 Creating duplicate tyre with different vendor...');

    const duplicateTyre = await TyreModel.create({
      productImages: tyreData[0].images,
      productDescription: tyreData[0].description + ' - Premium version',
      published_status: 'PUBLISHED',
      created_by: testUser._id,
      tyreWidthType: 'MM',
      tyreWidth: [tyreWidths[0]._id], // Same size as first tyre
      rimDiameter: [rimDiameters[0]._id], // Same diameter as first tyre
    });

    const duplicateProduct = await Product.create({
      product_category: 'TYRE',
      tyre: duplicateTyre._id,
      product_name: tyreData[0].name + ' - Premium',
      product_description: duplicateTyre.productDescription,
      brand: brands[0]._id, // Same brand
      vendor: vendors[1]._id, // Different vendor
      cost_price: 3500,
      mrp_price: 6000,
      rcp_price: 6000,
      auto_deal_price: 4800,
      stock_quantity: 30,
      product_images: tyreData[0].images,
      published_status: 'PUBLISHED',
      product_status: 'Active',
      in_stock: true,
      published_date: new Date(),
    });

    products.push(duplicateProduct);
    console.log(
      `✅ Created duplicate tyre product: ${duplicateProduct.product_name}`
    );

    console.log('\n🎉 TYRE PRODUCTS CREATED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`✅ Total Products Created: ${products.length}`);
    console.log('✅ Multi-vendor setup ready for testing');
    console.log('🔗 Test the API:');
    console.log(
      '   - Multi-vendor tyres: http://localhost:9042/api/products/website/multi-vendor?type=TYRE'
    );
    console.log(
      '   - Regular tyres: http://localhost:9042/api/products/website?productType=tyres'
    );

    process.exit();
  } catch (error) {
    console.error('❌ Error creating tyre products:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

createTyreProducts();
