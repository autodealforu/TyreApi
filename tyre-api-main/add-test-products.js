// Quick script to add test alloy wheel and service products
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from './api/products/ProductModel.js';
import AlloyWheel from './api/alloy-wheels/alloyWheelModel.js';
import Service from './api/services/ServiceModel.js';
import Brand from './api/brands/BrandModel.js';
import Vendor from './api/vendors/VendorModel.js';
import User from './api/users/UserModel.js';
import ProductType from './api/product-types/productTypeModel.js';
import AlloyDiameter from './api/alloy-wheels/AlloyDiameterModel.js';
import AlloyWidth from './api/alloy-wheels/AlloyWidthModel.js';
import AlloyPCD from './api/alloy-wheels/AlloyPCDModel.js';
import AlloyOffset from './api/alloy-wheels/AlloyOffsetModel.js';
import AlloyBoreSize from './api/alloy-wheels/AlloyBoreSizeModel.js';
import AlloyFinish from './api/alloy-wheels/AlloyFinishModel.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const addTestProducts = async () => {
  try {
    console.log('🚀 Adding test alloy wheel and service products...');

    // Get existing data
    const testUser = await User.findOne();
    const brands = await Brand.find().limit(10);
    const vendors = await Vendor.find().limit(3);

    // Get or create a ProductType for services
    let serviceProductType = await ProductType.findOne({ name: 'Service' });
    if (!serviceProductType) {
      serviceProductType = await ProductType.create({
        name: 'Service',
        created_by: testUser._id,
      });
    }

    // Try to create a service product first (simpler)
    console.log('🔧 Creating test service product...');

    const service = await Service.create({
      serviceName: 'Tyre Installation & Balancing',
      serviceDescription:
        'Professional tyre installation and wheel balancing service',
      serviceShortName: 'Tyre Install',
      serviceType: 'Installation',
      estimatedTime: '30-45 minutes',
      serviceImages: [
        'https://via.placeholder.com/400x400/FF6B61/FFFFFF?text=Service+1',
      ],
      created_by: testUser._id,
      published_status: 'PUBLISHED',
      productType: serviceProductType._id,
      hsnCode: '998341',
      gstTaxRate: '18',
      gstType: 'CGST_SGST',
      unit: 'SERVICE',
    });

    const serviceProduct = await Product.create({
      product_category: 'SERVICE',
      service: service._id,
      product_name: 'Tyre Installation & Balancing',
      product_description: service.serviceDescription,
      brand: brands[8]._id,
      vendor: vendors[0]._id,
      cost_price: 500,
      mrp_price: 1000,
      rcp_price: 1000,
      auto_deal_price: 750,
      stock_quantity: 999,
      product_images: service.serviceImages,
      published_status: 'PUBLISHED',
      product_status: 'Active',
      in_stock: true,
    });

    console.log('✅ Created service product:', serviceProduct.product_name);

    // Try to get alloy wheel supporting data
    const alloyDiameters = await AlloyDiameter.find().limit(1);
    const alloyWidths = await AlloyWidth.find().limit(1);
    const alloyPCDs = await AlloyPCD.find().limit(1);
    const alloyOffsets = await AlloyOffset.find().limit(1);
    const alloyBoreSizes = await AlloyBoreSize.find().limit(1);
    const alloyFinishes = await AlloyFinish.find().limit(1);

    if (
      alloyDiameters.length > 0 &&
      alloyWidths.length > 0 &&
      alloyPCDs.length > 0 &&
      alloyOffsets.length > 0 &&
      alloyBoreSizes.length > 0 &&
      alloyFinishes.length > 0
    ) {
      console.log('⚙️ Creating test alloy wheel product...');

      const wheel = await AlloyWheel.create({
        alloyDiameterInches: alloyDiameters[0]._id,
        alloyWidth: alloyWidths[0]._id,
        alloyPCD: alloyPCDs[0]._id,
        alloyOffset: alloyOffsets[0]._id,
        alloyBoreSizeMM: alloyBoreSizes[0]._id,
        alloyBrand: brands[5]._id,
        alloyDesignName: 'Sport Series',
        alloyFinish: alloyFinishes[0]._id,
        created_by: testUser._id,
        productImages: [
          'https://via.placeholder.com/400x400/444444/FFFFFF?text=Wheel+1',
        ],
        productDescription: 'High-performance alloy wheel',
        published_status: 'PUBLISHED',
      });

      const wheelProduct = await Product.create({
        product_category: 'ALLOY_WHEEL',
        alloy_wheel: wheel._id,
        product_name: 'OZ Racing Ultraleggera',
        product_description: wheel.productDescription,
        brand: brands[5]._id,
        vendor: vendors[1]._id,
        cost_price: 8000,
        mrp_price: 12000,
        rcp_price: 12000,
        auto_deal_price: 10000,
        stock_quantity: 20,
        product_images: wheel.productImages,
        published_status: 'PUBLISHED',
        product_status: 'Active',
        in_stock: true,
      });

      console.log('✅ Created alloy wheel product:', wheelProduct.product_name);
    } else {
      console.log(
        '⚠️ Missing alloy wheel supporting data, skipping alloy wheel creation'
      );
    }

    console.log('\n🎉 Test products added successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error adding test products:', error);
    process.exit(1);
  }
};

addTestProducts();
