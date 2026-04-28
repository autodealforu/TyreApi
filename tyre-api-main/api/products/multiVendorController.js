import asyncHandler from 'express-async-handler';
import Product from './ProductModel.js';
import TyreModel from '../tyres/TyreModel.js';
import AlloyWheel from '../alloy-wheels/alloyWheelModel.js';
import Service from '../services/ServiceModel.js';
import User from '../users/UserModel.js';

// @desc    Get products grouped by specifications with multiple vendors
// @route   GET /api/products/website/multi-vendor
// @access  Public
const getMultiVendorProducts = asyncHandler(async (req, res) => {
  try {
    const {
      type = 'TYRE',
      page = 1,
      limit = 12,
      brand,
      priceMin,
      priceMax,
      sortBy = 'price_low',
      search,
      pincode,
      rimDiameter,
      tyreWidth,
      alloyDiameter,
      alloyWidth,
      serviceType,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build base filter
    let baseFilter = {
      product_category: type,
      published_status: 'PUBLISHED',
      product_status: 'Active',
      in_stock: true,
    };

    // Price filter
    if (priceMin || priceMax) {
      baseFilter.auto_deal_price = {};
      if (priceMin) baseFilter.auto_deal_price.$gte = Number(priceMin);
      if (priceMax) baseFilter.auto_deal_price.$lte = Number(priceMax);
    }

    // Search filter
    if (search) {
      baseFilter.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { product_description: { $regex: search, $options: 'i' } },
      ];
    }

    let aggregationPipeline = [];

    // Base match stage
    aggregationPipeline.push({ $match: baseFilter });

    // Populate vendor information
    aggregationPipeline.push({
      $lookup: {
        from: 'users',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendorInfo',
      },
    });

    // Populate brand information
    aggregationPipeline.push({
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brandInfo',
      },
    });

    // Type-specific population and grouping
    switch (type) {
      case 'TYRE':
        // Populate tyre details
        aggregationPipeline.push({
          $lookup: {
            from: 'tyremodels',
            localField: 'tyre',
            foreignField: '_id',
            as: 'tyreDetails',
            pipeline: [
              {
                $lookup: {
                  from: 'tyrewidths',
                  localField: 'tyreWidth',
                  foreignField: '_id',
                  as: 'tyreWidth',
                },
              },
              {
                $lookup: {
                  from: 'rimdiameters',
                  localField: 'rimDiameter',
                  foreignField: '_id',
                  as: 'rimDiameter',
                },
              },
              {
                $lookup: {
                  from: 'aspectratios',
                  localField: 'aspectRatio',
                  foreignField: '_id',
                  as: 'aspectRatio',
                },
              },
              {
                $lookup: {
                  from: 'brands',
                  localField: 'productBrand',
                  foreignField: '_id',
                  as: 'productBrand',
                },
              },
            ],
          },
        });

        // Group by tyre specifications
        aggregationPipeline.push({
          $group: {
            _id: {
              tyreWidth: { $arrayElemAt: ['$tyreDetails.tyreWidth.name', 0] },
              aspectRatio: {
                $arrayElemAt: ['$tyreDetails.aspectRatio.name', 0],
              },
              rimDiameter: {
                $arrayElemAt: ['$tyreDetails.rimDiameter.name', 0],
              },
              productBrand: {
                $arrayElemAt: ['$tyreDetails.productBrand.name', 0],
              },
            },
            productSpec: { $first: '$tyreDetails' },
            vendors: {
              $push: {
                productId: '$_id',
                vendorId: '$vendor',
                vendorInfo: { $arrayElemAt: ['$vendorInfo', 0] },
                brandInfo: { $arrayElemAt: ['$brandInfo', 0] },
                prices: {
                  cost_price: '$cost_price',
                  mrp_price: '$mrp_price',
                  rcp_price: '$rcp_price',
                  auto_deal_price: '$auto_deal_price',
                },
                stock: '$stock',
                in_stock: '$in_stock',
                product_images: '$product_images',
                createdAt: '$createdAt',
              },
            },
            minPrice: { $min: '$auto_deal_price' },
            maxPrice: { $max: '$auto_deal_price' },
            vendorCount: { $sum: 1 },
          },
        });
        break;

      case 'ALLOY_WHEEL':
        // Populate alloy wheel details
        aggregationPipeline.push({
          $lookup: {
            from: 'alloywheels',
            localField: 'alloy_wheel',
            foreignField: '_id',
            as: 'alloyDetails',
            pipeline: [
              {
                $lookup: {
                  from: 'alloydiameters',
                  localField: 'alloyDiameterInches',
                  foreignField: '_id',
                  as: 'alloyDiameter',
                },
              },
              {
                $lookup: {
                  from: 'alloywidths',
                  localField: 'alloyWidth',
                  foreignField: '_id',
                  as: 'alloyWidth',
                },
              },
              {
                $lookup: {
                  from: 'brands',
                  localField: 'alloyBrand',
                  foreignField: '_id',
                  as: 'alloyBrand',
                },
              },
            ],
          },
        });

        // Group by alloy wheel specifications
        aggregationPipeline.push({
          $group: {
            _id: {
              diameter: {
                $arrayElemAt: ['$alloyDetails.alloyDiameter.name', 0],
              },
              width: { $arrayElemAt: ['$alloyDetails.alloyWidth.name', 0] },
              brand: { $arrayElemAt: ['$alloyDetails.alloyBrand.name', 0] },
              designName: {
                $arrayElemAt: ['$alloyDetails.alloyDesignName', 0],
              },
            },
            productSpec: { $first: '$alloyDetails' },
            vendors: {
              $push: {
                productId: '$_id',
                vendorId: '$vendor',
                vendorInfo: { $arrayElemAt: ['$vendorInfo', 0] },
                brandInfo: { $arrayElemAt: ['$brandInfo', 0] },
                prices: {
                  cost_price: '$cost_price',
                  mrp_price: '$mrp_price',
                  rcp_price: '$rcp_price',
                  auto_deal_price: '$auto_deal_price',
                },
                stock: '$stock',
                in_stock: '$in_stock',
                product_images: '$product_images',
                createdAt: '$createdAt',
              },
            },
            minPrice: { $min: '$auto_deal_price' },
            maxPrice: { $max: '$auto_deal_price' },
            vendorCount: { $sum: 1 },
          },
        });
        break;

      case 'SERVICE':
        // Populate service details
        aggregationPipeline.push({
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'serviceDetails',
          },
        });

        // Group by service specifications
        aggregationPipeline.push({
          $group: {
            _id: {
              serviceName: { $arrayElemAt: ['$serviceDetails.serviceName', 0] },
              serviceCategory: {
                $arrayElemAt: ['$serviceDetails.serviceCategory', 0],
              },
            },
            productSpec: { $first: '$serviceDetails' },
            vendors: {
              $push: {
                productId: '$_id',
                vendorId: '$vendor',
                vendorInfo: { $arrayElemAt: ['$vendorInfo', 0] },
                brandInfo: { $arrayElemAt: ['$brandInfo', 0] },
                prices: {
                  cost_price: '$cost_price',
                  mrp_price: '$mrp_price',
                  rcp_price: '$rcp_price',
                  auto_deal_price: '$auto_deal_price',
                },
                stock: '$stock',
                in_stock: '$in_stock',
                product_images: '$product_images',
                createdAt: '$createdAt',
              },
            },
            minPrice: { $min: '$auto_deal_price' },
            maxPrice: { $max: '$auto_deal_price' },
            vendorCount: { $sum: 1 },
          },
        });
        break;
    }

    // Apply pincode filter if provided
    if (pincode) {
      aggregationPipeline.push({
        $addFields: {
          vendors: {
            $filter: {
              input: '$vendors',
              cond: {
                $or: [
                  {
                    $regexMatch: {
                      input: '$$this.vendorInfo.vendor.pickup_address.0.pin',
                      regex: pincode,
                      options: 'i',
                    },
                  },
                  {
                    $regexMatch: {
                      input: pincode,
                      regex: '$$this.vendorInfo.vendor.pickup_address.0.pin',
                      options: 'i',
                    },
                  },
                ],
              },
            },
          },
        },
      });

      // Filter out groups with no vendors after pincode filter
      aggregationPipeline.push({
        $match: {
          'vendors.0': { $exists: true },
        },
      });
    }

    // Sort vendors within each group
    aggregationPipeline.push({
      $addFields: {
        vendors: {
          $sortArray: {
            input: '$vendors',
            sortBy: { 'prices.auto_deal_price': 1 },
          },
        },
      },
    });

    // Sort groups based on sortBy parameter
    let sortStage = {};
    switch (sortBy) {
      case 'price_low':
        sortStage = { minPrice: 1 };
        break;
      case 'price_high':
        sortStage = { minPrice: -1 };
        break;
      case 'vendors_most':
        sortStage = { vendorCount: -1 };
        break;
      case 'newest':
      default:
        sortStage = { 'vendors.0.createdAt': -1 };
        break;
    }
    aggregationPipeline.push({ $sort: sortStage });

    // Pagination
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNumber });

    // Execute aggregation
    const results = await Product.aggregate(aggregationPipeline);

    // Get total count for pagination
    const totalPipeline = [...aggregationPipeline];
    totalPipeline.pop(); // Remove limit
    totalPipeline.pop(); // Remove skip
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Product.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        products: results,
        pagination: {
          page: pageNumber,
          pages: totalPages,
          total,
          limit: limitNumber,
        },
        filters: {
          type,
          pincode,
          applied_filters: {
            brand,
            priceMin,
            priceMax,
            search,
            ...(type === 'TYRE' && { rimDiameter, tyreWidth }),
            ...(type === 'ALLOY_WHEEL' && { alloyDiameter, alloyWidth }),
            ...(type === 'SERVICE' && { serviceType }),
          },
        },
      },
    });
  } catch (error) {
    console.error('Multi-vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching multi-vendor products',
      error: error.message,
    });
  }
});

// @desc    Get single product with all vendor options
// @route   GET /api/products/website/multi-vendor/:specId
// @access  Public
const getProductWithVendors = asyncHandler(async (req, res) => {
  try {
    const { type, specId } = req.params;
    const { pincode } = req.query;

    // This would be implemented based on the specific product type
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      data: {
        product: null,
        vendors: [],
        message: 'Product details with vendors - to be implemented',
      },
    });
  } catch (error) {
    console.error('Product with vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product with vendors',
      error: error.message,
    });
  }
});

export { getMultiVendorProducts, getProductWithVendors };
