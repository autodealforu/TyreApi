import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Product from '../products/ProductModel.js';
import TyreModel from '../tyres/TyreModel.js';
import AlloyWheel from '../alloy-wheels/alloyWheelModel.js';
import Service from '../services/ServiceModel.js';

// @desc    Get all vendors for a specific product by specifications
// @route   GET /api/products/website/single-product/:type/:specId
// @access  Public
const getSingleProductWithVendors = asyncHandler(async (req, res) => {
  try {
    const { type, specId } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = 'price_low',
      pincode,
      priceMin,
      priceMax,
      search,
    } = req.query;

    let pipeline = [];

    // Base match conditions
    const matchConditions = {
      product_status: 'Active',
      published_status: 'PUBLISHED',
      in_stock: true,
    };

    // Add product category filter
    switch (type) {
      case 'TYRE':
        matchConditions.product_category = 'TYRE';
        break;
      case 'ALLOY_WHEEL':
        matchConditions.product_category = 'ALLOY_WHEEL';
        break;
      case 'SERVICE':
        matchConditions.product_category = 'SERVICE';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid product type',
        });
    }

    pipeline.push({ $match: matchConditions });

    // Populate product specifications based on type
    switch (type) {
      case 'TYRE':
        pipeline.push({
          $lookup: {
            from: 'tyremodels',
            localField: 'tyre',
            foreignField: '_id',
            as: 'tyreDetails',
          },
        });
        pipeline.push({
          $unwind: '$tyreDetails',
        });
        pipeline.push({
          $lookup: {
            from: 'tyrewidths',
            localField: 'tyreDetails.tyreWidth',
            foreignField: '_id',
            as: 'tyreDetails.tyreWidth',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'rimdiameters',
            localField: 'tyreDetails.rimDiameter',
            foreignField: '_id',
            as: 'tyreDetails.rimDiameter',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'aspectratios',
            localField: 'tyreDetails.aspectRatio',
            foreignField: '_id',
            as: 'tyreDetails.aspectRatio',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'brands',
            localField: 'tyreDetails.productBrand',
            foreignField: '_id',
            as: 'tyreDetails.productBrand',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'threadpatterns',
            localField: 'tyreDetails.productThreadPattern',
            foreignField: '_id',
            as: 'tyreDetails.productThreadPattern',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'plyratings',
            localField: 'tyreDetails.plyRating',
            foreignField: '_id',
            as: 'tyreDetails.plyRating',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'loadindexes',
            localField: 'tyreDetails.loadIndex',
            foreignField: '_id',
            as: 'tyreDetails.loadIndex',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'speedsymbols',
            localField: 'tyreDetails.speedSymbol',
            foreignField: '_id',
            as: 'tyreDetails.speedSymbol',
          },
        });
        pipeline.push({
          $addFields: {
            'tyreDetails.productBrand': {
              $arrayElemAt: ['$tyreDetails.productBrand', 0],
            },
          },
        });
        break;

      case 'ALLOY_WHEEL':
        pipeline.push({
          $lookup: {
            from: 'alloywheels',
            localField: 'alloy_wheel',
            foreignField: '_id',
            as: 'alloyDetails',
          },
        });
        pipeline.push({
          $unwind: '$alloyDetails',
        });
        pipeline.push({
          $lookup: {
            from: 'alloydiameterinches',
            localField: 'alloyDetails.alloyDiameterInches',
            foreignField: '_id',
            as: 'alloyDetails.alloyDiameterInches',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'alloywidths',
            localField: 'alloyDetails.alloyWidth',
            foreignField: '_id',
            as: 'alloyDetails.alloyWidth',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'brands',
            localField: 'alloyDetails.alloyBrand',
            foreignField: '_id',
            as: 'alloyDetails.alloyBrand',
          },
        });
        pipeline.push({
          $lookup: {
            from: 'alloyfinishes',
            localField: 'alloyDetails.alloyFinish',
            foreignField: '_id',
            as: 'alloyDetails.alloyFinish',
          },
        });
        pipeline.push({
          $addFields: {
            'alloyDetails.alloyBrand': {
              $arrayElemAt: ['$alloyDetails.alloyBrand', 0],
            },
          },
        });
        break;

      case 'SERVICE':
        pipeline.push({
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'serviceDetails',
          },
        });
        pipeline.push({
          $unwind: '$serviceDetails',
        });
        break;
    }

    // Filter by specific product specification
    if (type === 'TYRE') {
      pipeline.push({
        $match: {
          'tyreDetails._id': new mongoose.Types.ObjectId(specId),
        },
      });
    } else if (type === 'ALLOY_WHEEL') {
      pipeline.push({
        $match: {
          'alloyDetails._id': new mongoose.Types.ObjectId(specId),
        },
      });
    } else if (type === 'SERVICE') {
      pipeline.push({
        $match: {
          'serviceDetails._id': new mongoose.Types.ObjectId(specId),
        },
      });
    }

    // Populate vendor and brand details
    pipeline.push({
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendorDetails',
      },
    });

    pipeline.push({
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brandDetails',
      },
    });

    pipeline.push({
      $unwind: { path: '$vendorDetails', preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $unwind: { path: '$brandDetails', preserveNullAndEmptyArrays: true },
    });

    // Apply filters
    const additionalFilters = {};

    if (priceMin) {
      additionalFilters.auto_deal_price = { $gte: parseInt(priceMin) };
    }
    if (priceMax) {
      if (additionalFilters.auto_deal_price) {
        additionalFilters.auto_deal_price.$lte = parseInt(priceMax);
      } else {
        additionalFilters.auto_deal_price = { $lte: parseInt(priceMax) };
      }
    }

    if (search) {
      additionalFilters.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { product_description: { $regex: search, $options: 'i' } },
        { 'vendorDetails.store_name': { $regex: search, $options: 'i' } },
        { 'brandDetails.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (pincode) {
      additionalFilters['vendorDetails.service_areas'] = {
        $elemMatch: { pincode: pincode },
      };
    }

    if (Object.keys(additionalFilters).length > 0) {
      pipeline.push({ $match: additionalFilters });
    }

    // Sort products
    let sortStage = {};
    switch (sortBy) {
      case 'price_low':
        sortStage = { auto_deal_price: 1 };
        break;
      case 'price_high':
        sortStage = { auto_deal_price: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'rating':
        sortStage = { 'vendorDetails.rating': -1 };
        break;
      default:
        sortStage = { auto_deal_price: 1 };
    }

    pipeline.push({ $sort: sortStage });

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project final result
    pipeline.push({
      $project: {
        _id: 1,
        product_name: 1,
        product_description: 1,
        product_images: 1,
        auto_deal_price: 1,
        mrp_price: 1,
        rcp_price: 1,
        cost_price: 1,
        stock_quantity: 1,
        in_stock: 1,
        product_status: 1,
        published_date: 1,
        createdAt: 1,
        productSpec:
          type === 'TYRE'
            ? '$tyreDetails'
            : type === 'ALLOY_WHEEL'
            ? '$alloyDetails'
            : '$serviceDetails',
        vendor: {
          _id: '$vendorDetails._id',
          store_name: '$vendorDetails.store_name',
          name: '$vendorDetails.name',
          phone: '$vendorDetails.phone',
          email: '$vendorDetails.email',
          address: '$vendorDetails.address',
          city: '$vendorDetails.city',
          state: '$vendorDetails.state',
          pincode: '$vendorDetails.pincode',
          rating: '$vendorDetails.rating',
          service_areas: '$vendorDetails.service_areas',
          delivery_time: '$vendorDetails.delivery_time',
        },
        brand: {
          _id: '$brandDetails._id',
          name: '$brandDetails.name',
        },
      },
    });

    const products = await Product.aggregate(pipeline);

    // Calculate min and max prices
    const minPrice =
      products.length > 0
        ? Math.min(...products.map((p) => p.auto_deal_price))
        : 0;
    const maxPrice =
      products.length > 0
        ? Math.max(...products.map((p) => p.auto_deal_price))
        : 0;

    // Get the cheapest product
    const cheapestProduct = products.length > 0 ? products[0] : null;

    // Calculate pagination
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        cheapestProduct,
        minPrice,
        maxPrice,
        productSpec: cheapestProduct?.productSpec || null,
        pagination: {
          page: parseInt(page),
          pages,
          total,
          limit: parseInt(limit),
        },
        filters: {
          type,
          specId,
          appliedFilters: {
            sortBy,
            pincode: pincode || null,
            priceMin: priceMin || null,
            priceMax: priceMax || null,
            search: search || null,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in getSingleProductWithVendors:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
});

export { getSingleProductWithVendors };
