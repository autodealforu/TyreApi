import asyncHandler from 'express-async-handler';
import Product from './ProductModel.js';
import Brand from '../brands/BrandModel.js';
import RimDiameter from '../rim-diameters/rimDiameterModel.js';
import TyreWidth from '../tyre-widths/tyreWidthModel.js';
import AspectRatio from '../aspect-ratios/aspectRatioModel.js';
import LoadIndex from '../load-indexes/loadIndexModel.js';
import SpeedSymbol from '../speed-symbols/speedSymbolModel.js';
import PlyRating from '../plyratings/plyRatingModel.js';
import ThreadPattern from '../thread-patterns/threadPatternModel.js';
import ProductType from '../product-types/productTypeModel.js';
import AlloyDiameter from '../alloy-wheels/AlloyDiameterModel.js';
import AlloyWidth from '../alloy-wheels/AlloyWidthModel.js';
import AlloyPCD from '../alloy-wheels/AlloyPCDModel.js';
import AlloyOffset from '../alloy-wheels/AlloyOffsetModel.js';
import AlloyFinish from '../alloy-wheels/AlloyFinishModel.js';
import AlloyBoreSize from '../alloy-wheels/AlloyBoreSizeModel.js';

// @desc    Get products with enhanced filtering (website specific)
// @route   GET /api/products/website
// @access  Public
const getWebsiteProducts = asyncHandler(async (req, res) => {
  try {
    const {
      type = 'TYRE',
      page = 1,
      limit = 12,
      brand,
      priceMin,
      priceMax,
      sortBy = 'newest',
      search,
      rimDiameter,
      tyreWidth,
      alloyDiameter,
      alloyWidth,
      pcd,
      offset,
      finish,
      serviceType,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    let filter = {
      product_category: type,
      published_status: 'PUBLISHED',
      in_stock: true,
    };

    // Price filter
    if (priceMin || priceMax) {
      filter.auto_deal_price = {};
      if (priceMin) filter.auto_deal_price.$gte = Number(priceMin);
      if (priceMax) filter.auto_deal_price.$lte = Number(priceMax);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { product_description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { auto_deal_price: 1 };
        break;
      case 'price_high':
        sortOptions = { auto_deal_price: -1 };
        break;
      case 'name':
        sortOptions = { product_name: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Base query
    let query = Product.find(filter);

    // Populate based on product type
    switch (type) {
      case 'TYRE':
        query = query.populate({
          path: 'tyre',
          populate: [
            { path: 'rimDiameter', select: 'name' },
            { path: 'tyreWidth', select: 'name' },
            { path: 'aspectRatio', select: 'name' },
            { path: 'productBrand', select: 'name' },
            { path: 'productThreadPattern', select: 'name' },
            { path: 'loadIndex', select: 'name' },
            { path: 'speedSymbol', select: 'name' },
            { path: 'plyRating', select: 'name' },
          ],
        });
        break;
      case 'ALLOY_WHEEL':
        query = query.populate({
          path: 'alloy_wheel',
          populate: [
            { path: 'alloyDiameterInches', select: 'name' },
            { path: 'alloyWidth', select: 'name' },
            { path: 'alloyPCD', select: 'name' },
            { path: 'alloyOffset', select: 'name' },
            { path: 'alloyBoreSizeMM', select: 'name' },
            { path: 'alloyBrand', select: 'name' },
            { path: 'alloyFinish', select: 'name' },
          ],
        });
        break;
      case 'SERVICE':
        query = query.populate('service');
        break;
    }

    // Always populate vendor
    query = query.populate('vendor', 'name store_name location phone');

    // Execute query
    const products = await query
      .sort(sortOptions)
      .limit(limitNumber)
      .skip(skip);

    // Get total count
    const total = await Product.countDocuments(filter);

    // Filter products based on populated fields (for specific attribute filters)
    let filteredProducts = products;

    if (type === 'TYRE') {
      if (brand) {
        const brandNames = brand.split(',').map((b) => b.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          brandNames.includes(product.tyre?.productBrand?.name?.toLowerCase())
        );
      }
      if (rimDiameter) {
        const rimDiameters = rimDiameter
          .split(',')
          .map((r) => r.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          rimDiameters.includes(product.tyre?.rimDiameter?.name?.toLowerCase())
        );
      }
      if (tyreWidth) {
        const tyreWidths = tyreWidth
          .split(',')
          .map((w) => w.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          tyreWidths.includes(product.tyre?.tyreWidth?.name?.toLowerCase())
        );
      }
    }

    if (type === 'ALLOY_WHEEL') {
      if (brand) {
        const brandNames = brand.split(',').map((b) => b.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          brandNames.includes(
            product.alloy_wheel?.alloyBrand?.name?.toLowerCase()
          )
        );
      }
      if (alloyDiameter) {
        const alloyDiameters = alloyDiameter
          .split(',')
          .map((d) => d.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          alloyDiameters.includes(
            product.alloy_wheel?.alloyDiameterInches?.name?.toLowerCase()
          )
        );
      }
      if (alloyWidth) {
        const alloyWidths = alloyWidth
          .split(',')
          .map((w) => w.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          alloyWidths.includes(
            product.alloy_wheel?.alloyWidth?.name?.toLowerCase()
          )
        );
      }
      if (pcd) {
        const alloyPCDs = pcd.split(',').map((p) => p.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          alloyPCDs.includes(product.alloy_wheel?.alloyPCD?.name?.toLowerCase())
        );
      }
      if (offset) {
        const alloyOffsets = offset
          .split(',')
          .map((o) => o.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          alloyOffsets.includes(
            product.alloy_wheel?.alloyOffset?.name?.toLowerCase()
          )
        );
      }
      if (finish) {
        const alloyFinishes = finish
          .split(',')
          .map((f) => f.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          alloyFinishes.includes(
            product.alloy_wheel?.alloyFinish?.name?.toLowerCase()
          )
        );
      }
    }

    if (type === 'SERVICE') {
      if (serviceType) {
        const serviceTypes = serviceType
          .split(',')
          .map((s) => s.trim().toLowerCase());
        filteredProducts = filteredProducts.filter((product) =>
          serviceTypes.includes(product.service?.serviceCategory?.toLowerCase())
        );
      }
    }

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          page: pageNumber,
          pages: Math.ceil(total / limitNumber),
          total,
          limit: limitNumber,
        },
        filters: {
          type,
          appliedFilters: {
            brand,
            priceMin,
            priceMax,
            sortBy,
            search,
            rimDiameter,
            tyreWidth,
            alloyDiameter,
            alloyWidth,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get website products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @desc    Get filter options for website
// @route   GET /api/products/website/filters/:type
// @access  Public
const getFilterOptions = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;

    if (!['TYRE', 'ALLOY_WHEEL', 'SERVICE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product category',
      });
    }

    let filterOptions = {
      brands: [],
      priceRange: { min: 0, max: 10000 },
    };

    // Get price range
    const priceStats = await Product.aggregate([
      {
        $match: {
          product_category: type,
          published_status: 'PUBLISHED',
          in_stock: true,
        },
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$auto_deal_price' },
          maxPrice: { $max: '$auto_deal_price' },
        },
      },
    ]);

    if (priceStats.length > 0) {
      filterOptions.priceRange = {
        min: Math.floor(priceStats[0].minPrice || 0),
        max: Math.ceil(priceStats[0].maxPrice || 10000),
      };
    }

    switch (type) {
      case 'TYRE':
        // Get tyre-specific filters
        const [
          tyreProducts,
          rimDiameters,
          tyreWidths,
          brands,
          aspectRatios,
          loadIndexes,
          speedSymbols,
          plyRatings,
          threadPatterns,
          productTypes,
        ] = await Promise.all([
          Product.find({
            product_category: 'TYRE',
            published_status: 'PUBLISHED',
          }).populate({
            path: 'tyre',
            populate: [{ path: 'productBrand', select: 'name' }],
          }),
          RimDiameter.find({ published_status: 'PUBLISHED' }).select(
            '_id name'
          ),
          TyreWidth.find({ published_status: 'PUBLISHED' }).select('_id name'),
          Brand.find({ published_status: 'PUBLISHED' }).select('_id name'),
          AspectRatio.find({ published_status: 'PUBLISHED' }).select(
            '_id name'
          ),
          LoadIndex.find({ published_status: 'PUBLISHED' }).select('_id name'),
          SpeedSymbol.find({ published_status: 'PUBLISHED' }).select(
            '_id name'
          ),
          PlyRating.find({ published_status: 'PUBLISHED' }).select('_id name'),
          ThreadPattern.find({ published_status: 'PUBLISHED' }).select(
            '_id name'
          ),
          ProductType.find({ published_status: 'PUBLISHED' }).select(
            '_id name'
          ),
        ]);

        // Extract unique brands from products (primary source)
        const tyreBrandsFromProducts = [
          ...new Set(
            tyreProducts.map((p) => p.tyre?.productBrand?.name).filter(Boolean)
          ),
        ];

        // Get brand objects (with _id and name) for the frontend
        let finalBrands;
        if (tyreBrandsFromProducts.length > 0) {
          // Filter brands collection to match the ones found in products
          finalBrands = brands.filter((b) =>
            tyreBrandsFromProducts.includes(b.name)
          );
        } else {
          // Fallback to all available brands
          finalBrands = brands;
        }

        console.log(
          'Debug - Brands from products:',
          tyreBrandsFromProducts.length
        );
        console.log('Debug - Total brands available:', brands.length);
        console.log('Debug - Final brands used:', finalBrands.length);

        filterOptions = {
          ...filterOptions,
          brands: finalBrands, // Return full objects with _id and name
          rimDiameters: rimDiameters, // Return full objects
          tyreWidths: tyreWidths, // Return full objects
          aspectRatios: aspectRatios, // Return full objects
          loadIndexes: loadIndexes, // Return full objects
          speedSymbols: speedSymbols, // Return full objects
          plyRatings: plyRatings, // Return full objects
          threadPatterns: threadPatterns, // Return full objects
          productTypes: productTypes, // Return full objects
        };
        break;

      case 'ALLOY_WHEEL':
        // Get alloy wheel-specific filters
        const [
          alloyProducts,
          alloyDiameters,
          alloyWidths,
          alloyPCDs,
          alloyOffsets,
          alloyFinishes,
          alloyBoreSizes,
          alloyBrands,
        ] = await Promise.all([
          Product.find({
            product_category: 'ALLOY_WHEEL',
            published_status: 'PUBLISHED',
          }).populate({
            path: 'alloy_wheel',
            populate: [{ path: 'alloyBrand', select: 'name' }],
          }),
          AlloyDiameter.find({ isActive: true }).select('_id name'),
          AlloyWidth.find({ isActive: true }).select('_id name'),
          AlloyPCD.find({ isActive: true }).select('_id name'),
          AlloyOffset.find({ isActive: true }).select('_id name'),
          AlloyFinish.find({ isActive: true }).select('_id name'),
          AlloyBoreSize.find({ isActive: true }).select('_id name'),
          Brand.find({ published_status: 'PUBLISHED' }).select('_id name'),
        ]);

        // Extract unique brands from products (primary source)
        const alloyBrandsFromProducts = [
          ...new Set(
            alloyProducts
              .map((p) => p.alloy_wheel?.alloyBrand?.name)
              .filter(Boolean)
          ),
        ];

        // Get brand objects (with _id and name) for the frontend
        let finalAlloyBrands;
        if (alloyBrandsFromProducts.length > 0) {
          // Filter brands collection to match the ones found in products
          finalAlloyBrands = alloyBrands.filter((b) =>
            alloyBrandsFromProducts.includes(b.name)
          );
        } else {
          // Fallback to all available brands
          finalAlloyBrands = alloyBrands;
        }

        filterOptions = {
          ...filterOptions,
          brands: finalAlloyBrands, // Return full objects with _id and name
          diameters: alloyDiameters, // Return full objects - using 'diameters' for frontend compatibility
          widths: alloyWidths, // Return full objects - using 'widths' for frontend compatibility
          pcds: alloyPCDs, // Return full objects
          offsets: alloyOffsets, // Return full objects
          finishes: alloyFinishes, // Return full objects
          boreSizes: alloyBoreSizes, // Return full objects
        };
        break;

      case 'SERVICE':
        // Get service-specific filters
        const serviceProducts = await Product.find({
          product_category: 'SERVICE',
          published_status: 'PUBLISHED',
        }).populate('service');

        const serviceTypes = [
          ...new Set(
            serviceProducts
              .map((p) => p.service?.serviceCategory)
              .filter(Boolean)
          ),
        ];

        filterOptions = {
          ...filterOptions,
          serviceTypes,
        };
        break;
    }

    res.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

export { getWebsiteProducts, getFilterOptions };
