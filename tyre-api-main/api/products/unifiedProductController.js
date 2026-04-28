import asyncHandler from 'express-async-handler';
import Product from './ProductModel.js';
import TyreModel from '../tyres/TyreModel.js';
import AlloyWheel from '../alloy-wheels/alloyWheelModel.js';
import Service from '../services/ServiceModel.js';

// @desc    Create a unified product (Tyre, Alloy Wheel, or Service)
// @route   POST /api/products/unified
// @access  Private
const createUnifiedProduct = asyncHandler(async (req, res) => {
  try {
    const { product_category, product_data, pricing_data } = req.body;

    if (
      !product_category ||
      !['TYRE', 'ALLOY_WHEEL', 'SERVICE'].includes(
        product_category.toUpperCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid product_category is required (TYRE, ALLOY_WHEEL, or SERVICE)',
      });
    }

    let mainProduct;

    // First create the main product (Tyre, Alloy Wheel, or Service)
    switch (product_category.toUpperCase()) {
      case 'TYRE':
        mainProduct = new TyreModel({
          ...product_data,
          created_by: req.user._id,
        });
        break;

      case 'ALLOY_WHEEL':
        mainProduct = new AlloyWheel({
          ...product_data,
          created_by: req.user._id,
        });
        break;

      case 'SERVICE':
        mainProduct = new Service({
          ...product_data,
          created_by: req.user._id,
        });
        break;
    }

    const savedMainProduct = await mainProduct.save();

    // Now create the Product entry with unified pricing
    const productEntry = Product.createWithCategory(
      product_category,
      { productId: savedMainProduct._id },
      {
        ...pricing_data,
        created_by: req.user._id,
        vendor: req.body.vendor || req.user._id,
      }
    );

    const savedProduct = await productEntry.save();

    // Populate the response
    const populateFields = getPopulateFields(product_category);
    let populatedProduct = await Product.findById(savedProduct._id)
      .populate('vendor', 'name username')
      .populate('created_by', 'name username');

    if (populateFields.path) {
      populatedProduct = await populatedProduct.populate(populateFields);
    }

    res.status(201).json({
      success: true,
      message: `${product_category} product created successfully`,
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error creating unified product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});

// @desc    Get all products with filtering by category
// @route   GET /api/products/unified
// @access  Public
const getUnifiedProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    let searchParams = { published_status: 'PUBLISHED' };

    // Filter by product category
    if (req.query.category) {
      searchParams.product_category = req.query.category.toUpperCase();
    }

    // Handle complex search parameters from frontend
    if (req.query.search) {
      if (typeof req.query.search === 'object') {
        // If search is an object with multiple fields
        const searchConditions = [];

        Object.keys(req.query.search).forEach((key) => {
          if (req.query.search[key]) {
            const searchTerm = req.query.search[key];

            // Add specific search conditions based on field
            switch (key) {
              case 'product_status':
                searchConditions.push({
                  product_status: { $regex: searchTerm, $options: 'i' },
                });
                break;
              case 'product_category':
                searchConditions.push({
                  product_category: { $regex: searchTerm, $options: 'i' },
                });
                break;
              case 'vendor':
                searchConditions.push({ vendor: searchTerm });
                break;
              case 'name':
                searchConditions.push({
                  name: { $regex: searchTerm, $options: 'i' },
                });
                break;
              default:
                // For other fields, try to search in multiple places
                searchConditions.push({
                  $or: [
                    { product_status: { $regex: searchTerm, $options: 'i' } },
                    { product_category: { $regex: searchTerm, $options: 'i' } },
                  ],
                });
            }
          }
        });

        if (searchConditions.length > 0) {
          searchParams.$and = searchConditions;
        }
      } else {
        // If search is a simple string
        const searchTerm = req.query.search;
        searchParams.$or = [
          { product_status: { $regex: searchTerm, $options: 'i' } },
          { product_category: { $regex: searchTerm, $options: 'i' } },
        ];
      }
    }

    // Handle exact search parameters (for dropdown selections)
    if (req.query.exact) {
      if (typeof req.query.exact === 'object') {
        Object.keys(req.query.exact).forEach((key) => {
          if (req.query.exact[key]) {
            const exactValue = req.query.exact[key];

            // Add exact match conditions
            switch (key) {
              case 'product_category':
                searchParams.product_category = exactValue.toUpperCase();
                break;
              case 'product_status':
                searchParams.product_status = exactValue;
                break;
              case 'vendor':
                searchParams.vendor = exactValue;
                break;
              default:
                searchParams[key] = exactValue;
            }
          }
        });
      }
    }

    // Handle conditional search parameters (for ranges, dates, etc.)
    if (req.query.conditional) {
      if (typeof req.query.conditional === 'object') {
        Object.keys(req.query.conditional).forEach((key) => {
          if (
            req.query.conditional[key] &&
            typeof req.query.conditional[key] === 'object'
          ) {
            Object.keys(req.query.conditional[key]).forEach((condition) => {
              if (req.query.conditional[key][condition]) {
                const value = req.query.conditional[key][condition];

                // Handle different types of conditional searches
                if (!searchParams[key]) {
                  searchParams[key] = {};
                }

                switch (condition) {
                  case '$gte':
                    searchParams[key].$gte = value;
                    break;
                  case '$lte':
                    searchParams[key].$lte = value;
                    break;
                  case '$gt':
                    searchParams[key].$gt = value;
                    break;
                  case '$lt':
                    searchParams[key].$lt = value;
                    break;
                  case '$ne':
                    searchParams[key].$ne = value;
                    break;
                  case '$in':
                    searchParams[key].$in = Array.isArray(value)
                      ? value
                      : [value];
                    break;
                  default:
                    searchParams[key][condition] = value;
                }
              }
            });
          }
        });
      }
    }

    // Filter by vendor
    if (req.query.vendor) {
      searchParams.vendor = req.query.vendor;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      searchParams.cost_price = {};
      if (req.query.minPrice)
        searchParams.cost_price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        searchParams.cost_price.$lte = Number(req.query.maxPrice);
    }

    const count = await Product.countDocuments(searchParams);

    // Build the base population array
    const basePopulation = [
      { path: 'vendor', select: 'name username' },
      { path: 'created_by', select: 'name username' },
    ];

    let query = Product.find(searchParams)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    // Apply base population
    basePopulation.forEach((popPath) => {
      query = query.populate(popPath);
    });

    const products = await query.exec();

    // Now populate category-specific fields for each product
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        let populatedProduct = product;

        try {
          switch (product.product_category) {
            case 'TYRE':
              if (product.tyre) {
                populatedProduct = await Product.findById(product._id)
                  .populate('vendor', 'name username')
                  .populate('created_by', 'name username')
                  .populate({
                    path: 'tyre',
                    populate: [
                      { path: 'rimDiameter', select: 'name' },
                      { path: 'tyreWidth', select: 'name' },
                      { path: 'aspectRatio', select: 'name' },
                      { path: 'loadIndex', select: 'name' },
                      { path: 'speedSymbol', select: 'name' },
                      { path: 'plyRating', select: 'name' },
                      { path: 'productBrand', select: 'name' },
                      { path: 'productThreadPattern', select: 'name' },
                      { path: 'productType', select: 'name' },
                    ],
                  });
              }
              break;

            case 'ALLOY_WHEEL':
              if (product.alloy_wheel) {
                populatedProduct = await Product.findById(product._id)
                  .populate('vendor', 'name username')
                  .populate('created_by', 'name username')
                  .populate({
                    path: 'alloy_wheel',
                    populate: [
                      { path: 'alloyDiameterInches', select: 'name' },
                      { path: 'alloyWidth', select: 'name' },
                      { path: 'alloyPCD', select: 'name' },
                      { path: 'alloyOffset', select: 'name' },
                      { path: 'alloyBoreSizeMM', select: 'name' },
                      { path: 'alloyBrand', select: 'name' },
                      { path: 'alloyFinish', select: 'name' },
                      { path: 'productType', select: 'name' },
                    ],
                  });
              }
              break;

            case 'SERVICE':
              if (product.service) {
                populatedProduct = await Product.findById(product._id)
                  .populate('vendor', 'name username')
                  .populate('created_by', 'name username')
                  .populate({
                    path: 'service',
                    populate: [
                      { path: 'serviceCategory', select: 'name' },
                      { path: 'serviceBrand', select: 'name' },
                    ],
                  });
              }
              break;
          }
        } catch (popError) {
          console.error(
            `Error populating ${product.product_category} product:`,
            popError
          );
          // Return the basic product if population fails
        }

        return populatedProduct;
      })
    );

    res.json({
      success: true,
      data: {
        products: populatedProducts,
        page,
        pages: Math.ceil(count / pageSize),
        count,
        hasNextPage: page < Math.ceil(count / pageSize),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching unified products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/unified/:id
// @access  Public
const getUnifiedProductById = asyncHandler(async (req, res) => {
  try {
    // First get the basic product
    let product = await Product.findById(req.params.id)
      .populate('vendor', 'name username')
      .populate('created_by', 'name username');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Now populate category-specific fields based on product category
    try {
      switch (product.product_category) {
        case 'TYRE':
          if (product.tyre) {
            product = await Product.findById(req.params.id)
              .populate('vendor', 'name username')
              .populate('created_by', 'name username')
              .populate({
                path: 'tyre',
                populate: [
                  { path: 'rimDiameter', select: 'name' },
                  { path: 'tyreWidth', select: 'name' },
                  { path: 'aspectRatio', select: 'name' },
                  { path: 'loadIndex', select: 'name' },
                  { path: 'speedSymbol', select: 'name' },
                  { path: 'plyRating', select: 'name' },
                  { path: 'productBrand', select: 'name' },
                  { path: 'productThreadPattern', select: 'name' },
                  { path: 'productType', select: 'name' },
                ],
              });
          }
          break;

        case 'ALLOY_WHEEL':
          if (product.alloy_wheel) {
            product = await Product.findById(req.params.id)
              .populate('vendor', 'name username')
              .populate('created_by', 'name username')
              .populate({
                path: 'alloy_wheel',
                populate: [
                  { path: 'alloyDiameterInches', select: 'name' },
                  { path: 'alloyWidth', select: 'name' },
                  { path: 'alloyPCD', select: 'name' },
                  { path: 'alloyOffset', select: 'name' },
                  { path: 'alloyBoreSizeMM', select: 'name' },
                  { path: 'alloyBrand', select: 'name' },
                  { path: 'alloyFinish', select: 'name' },
                  { path: 'productType', select: 'name' },
                ],
              });
          }
          break;

        case 'SERVICE':
          if (product.service) {
            product = await Product.findById(req.params.id)
              .populate('vendor', 'name username')
              .populate('created_by', 'name username')
              .populate({
                path: 'service',
                populate: [
                  { path: 'serviceCategory', select: 'name' },
                  { path: 'serviceBrand', select: 'name' },
                ],
              });
          }
          break;
      }
    } catch (popError) {
      console.error(
        `Error populating ${product.product_category} product:`,
        popError
      );
      // Continue with basic product if population fails
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
});

// @desc    Update unified product
// @route   PUT /api/products/unified/:id
// @access  Private
const updateUnifiedProduct = asyncHandler(async (req, res) => {
  try {
    const { product_data, pricing_data } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update the main product data
    if (product_data) {
      let mainProductId;
      switch (product.product_category) {
        case 'TYRE':
          mainProductId = product.tyre;
          await TyreModel.findByIdAndUpdate(mainProductId, {
            ...product_data,
            updated_by: req.user._id,
          });
          break;

        case 'ALLOY_WHEEL':
          mainProductId = product.alloy_wheel;
          await AlloyWheel.findByIdAndUpdate(mainProductId, {
            ...product_data,
            updated_by: req.user._id,
          });
          break;

        case 'SERVICE':
          mainProductId = product.service;
          await Service.findByIdAndUpdate(mainProductId, {
            ...product_data,
            updated_by: req.user._id,
          });
          break;
      }
    }

    // Update pricing data
    if (pricing_data) {
      Object.keys(pricing_data).forEach((key) => {
        product[key] = pricing_data[key];
      });
    }

    product.updated_by = req.user._id;
    const updatedProduct = await product.save();

    // Populate and return
    const populateFields = getPopulateFields(product.product_category);
    let populatedProduct = await Product.findById(updatedProduct._id)
      .populate('vendor', 'name username')
      .populate('created_by', 'name username')
      .populate('updated_by', 'name username');

    if (populateFields.path) {
      populatedProduct = await populatedProduct.populate(populateFields);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
});

// @desc    Delete unified product
// @route   DELETE /api/products/unified/:id
// @access  Private/Admin
const deleteUnifiedProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete the main product first
    let mainProductId;
    switch (product.product_category) {
      case 'TYRE':
        mainProductId = product.tyre;
        await TyreModel.findByIdAndDelete(mainProductId);
        break;

      case 'ALLOY_WHEEL':
        mainProductId = product.alloy_wheel;
        await AlloyWheel.findByIdAndDelete(mainProductId);
        break;

      case 'SERVICE':
        mainProductId = product.service;
        await Service.findByIdAndDelete(mainProductId);
        break;
    }

    // Delete the product entry
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
});

// @desc    Get products by category with specific population
// @route   GET /api/products/unified/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category.toUpperCase();

    if (!['TYRE', 'ALLOY_WHEEL', 'SERVICE'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be TYRE, ALLOY_WHEEL, or SERVICE',
      });
    }

    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const searchParams = {
      product_category: category,
      published_status: 'PUBLISHED',
    };

    const count = await Product.countDocuments(searchParams);

    const populateFields = getPopulateFields(category);
    let query = Product.find(searchParams)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 })
      .populate('vendor', 'name username')
      .populate('created_by', 'name username');

    if (populateFields.path) {
      query = query.populate(populateFields);
    }

    const products = await query;

    res.json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        count,
        category,
      },
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

// Helper function to get populate fields based on category
function getPopulateFields(category) {
  switch (category) {
    case 'TYRE':
      return {
        path: 'tyre',
        populate: [
          { path: 'rimDiameter', select: 'name' },
          { path: 'tyreWidth', select: 'name' },
          { path: 'aspectRatio', select: 'name' },
          { path: 'loadIndex', select: 'name' },
          { path: 'speedSymbol', select: 'name' },
          { path: 'plyRating', select: 'name' },
          { path: 'productBrand', select: 'name' },
          { path: 'productThreadPattern', select: 'name' },
          { path: 'productType', select: 'name' },
        ],
      };

    case 'ALLOY_WHEEL':
      return {
        path: 'alloy_wheel',
        populate: [
          { path: 'alloyDiameterInches', select: 'name' },
          { path: 'alloyWidth', select: 'name' },
          { path: 'alloyPCD', select: 'name' },
          { path: 'alloyOffset', select: 'name' },
          { path: 'alloyBoreSizeMM', select: 'name' },
          { path: 'alloyBrand', select: 'name' },
          { path: 'alloyFinish', select: 'name' },
          { path: 'productType', select: 'name' },
        ],
      };

    case 'SERVICE':
      return {
        path: 'service',
        populate: [
          { path: 'serviceCategory', select: 'name' },
          { path: 'serviceBrand', select: 'name' },
        ],
      };

    default:
      return {};
  }
}

export {
  createUnifiedProduct,
  getUnifiedProducts,
  getUnifiedProductById,
  updateUnifiedProduct,
  deleteUnifiedProduct,
  getProductsByCategory,
};
