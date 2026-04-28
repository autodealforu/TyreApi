import asyncHandler from 'express-async-handler';
import Product from '../products/ProductModel.js';
import TyreModel from '../tyres/TyreModel.js';
import AlloyWheel from '../alloy-wheels/alloyWheelModel.js';
import Service from '../services/ServiceModel.js';
import Brand from '../brands/BrandModel.js';

// @desc    Get featured products for homepage (all types)
// @route   GET /api/homepages/featured-products
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    // Get featured tyres
    const featuredTyres = await Product.find({
      product_category: 'TYRE',
      published_status: 'PUBLISHED',
      in_stock: true,
    })
      .populate({
        path: 'tyre',
        populate: [
          { path: 'rimDiameter', select: 'name' },
          { path: 'tyreWidth', select: 'name' },
          { path: 'aspectRatio', select: 'name' },
          { path: 'productBrand', select: 'name' },
          { path: 'productThreadPattern', select: 'name' },
          { path: 'plyRating', select: 'name' },
          { path: 'loadIndex', select: 'name' },
          { path: 'speedSymbol', select: 'name' },
        ],
      })
      .populate('vendor', 'name store_name')
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get featured alloy wheels
    const featuredAlloyWheels = await Product.find({
      product_category: 'ALLOY_WHEEL',
      published_status: 'PUBLISHED',
      in_stock: true,
    })
      .populate({
        path: 'alloy_wheel',
        populate: [
          { path: 'alloyDiameterInches', select: 'name' },
          { path: 'alloyWidth', select: 'name' },
          { path: 'alloyBrand', select: 'name' },
          { path: 'alloyFinish', select: 'name' },
        ],
      })
      .populate('vendor', 'name store_name')
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get featured services
    const featuredServices = await Product.find({
      product_category: 'SERVICE',
      published_status: 'PUBLISHED',
      in_stock: true,
    })
      .populate('service')
      .populate('vendor', 'name store_name')
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get popular brands
    const popularBrands = await Brand.find({
      published_status: 'PUBLISHED',
    })
      .limit(12)
      .sort({ createdAt: -1 });

    // Get product type counts
    const productCounts = await Product.aggregate([
      {
        $match: {
          published_status: 'PUBLISHED',
          in_stock: true,
        },
      },
      {
        $group: {
          _id: '$product_category',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      TYRE: 0,
      ALLOY_WHEEL: 0,
      SERVICE: 0,
    };

    productCounts.forEach((item) => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        tyres: featuredTyres,
        alloyWheels: featuredAlloyWheels,
        services: featuredServices,
        brands: popularBrands,
        productCounts: counts,
      },
    });
  } catch (error) {
    console.error('Homepage featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @desc    Get products by category for homepage sections
// @route   GET /api/homepages/category/:type
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const limit = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!['TYRE', 'ALLOY_WHEEL', 'SERVICE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product category',
      });
    }

    let populateOptions = [];

    switch (type) {
      case 'TYRE':
        populateOptions = [
          {
            path: 'tyre',
            populate: [
              { path: 'rimDiameter', select: 'name' },
              { path: 'tyreWidth', select: 'name' },
              { path: 'aspectRatio', select: 'name' },
              { path: 'productBrand', select: 'name' },
              { path: 'productThreadPattern', select: 'name' },
            ],
          },
        ];
        break;
      case 'ALLOY_WHEEL':
        populateOptions = [
          {
            path: 'alloy_wheel',
            populate: [
              { path: 'alloyDiameterInches', select: 'name' },
              { path: 'alloyWidth', select: 'name' },
              { path: 'alloyBrand', select: 'name' },
              { path: 'alloyFinish', select: 'name' },
            ],
          },
        ];
        break;
      case 'SERVICE':
        populateOptions = [{ path: 'service' }];
        break;
    }

    const products = await Product.find({
      product_category: type,
      published_status: 'PUBLISHED',
      in_stock: true,
    })
      .populate(populateOptions)
      .populate('vendor', 'name store_name')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      product_category: type,
      published_status: 'PUBLISHED',
      in_stock: true,
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

export { getFeaturedProducts, getProductsByCategory };
