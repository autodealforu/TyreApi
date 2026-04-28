import asyncHandler from 'express-async-handler';
import Product from './ProductModel.js';
import checkRequired from '../../utils/checkRequired.js';
import Collection from '../collections/CollectionModel.js';
import Productcategory from '../productcategorys/ProductcategoryModel.js';
import SubCategory from '../subcategorys/SubCategoryModel.js';
import SubSubCategory from '../subsubcategorys/SubSubCategoryModel.js';
import User from '../users/UserModel.js';
import mongoose from 'mongoose';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';

    if (!req.user) {
      searchParams['product_status'] = 'Active';
    }
    if (req.user && req.user.role === 'CUSTOMER') {
      searchParams['product_status'] = 'Active';
    }

    if (req.query.min_price && req.query.max_price) {
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }

    // MANDATORY Isolation logic: Vendors ONLY see their own products
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['vendor'] = mongoose.Types.ObjectId(req.user._id);
    }

    console.log('Search Params', searchParams);
    const count = await Product.countDocuments({ ...searchParams });
    let query = Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('vendor', 'name username')
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    // Execute query first
    const products = await query.exec();

    // Then populate each product based on its category
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        const populateFields = getPopulateFields(product.product_category);
        if (populateFields.path) {
          return await product.populate(populateFields);
        }
        return product;
      })
    );

    res.json({
      products: populatedProducts,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getProductsBulk = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    // searchParams['published_status'] = 'PUBLISHED';

    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)

      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsByCollection = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    if (req.query.min_price && req.query.max_price) {
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    // Block to get Collection Details
    const product_collection = await Collection.findOne({
      slug: req.params.slug,
    });
    if (product_collection) {
      if (product_collection.is_dynamic_collection) {
        // Conditions Check
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'PRICE'
        ) {
          const sale_price = {};
          sale_price[`${product_collection.dynamic_collection.condition}`] =
            product_collection.dynamic_collection.value;
          const exactQ = {
            sale_price: sale_price,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'DISCOUNT_FIXED'
        ) {
          const discount_fixed = {};
          discount_fixed[`${product_collection.dynamic_collection.condition}`] =
            [
              { $subtract: ['$regular_price', '$sale_price'] },
              product_collection.dynamic_collection.value,
            ];
          // { $eq: [ { $multiply: ["$PrecioCantidad", "$Cantidad"]} ], 1000}

          const exactQ = {
            $expr: discount_fixed,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'DISCOUNT_PERCENTAGE'
        ) {
          const discount_fixed = {};
          discount_fixed[`${product_collection.dynamic_collection.condition}`] =
            [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$regular_price', '$sale_price'] },
                      '$regular_price',
                    ],
                  },
                  100,
                ],
              },
              product_collection.dynamic_collection.value,
            ];
          // { $eq: [ { $multiply: ["$PrecioCantidad", "$Cantidad"]} ], 1000}

          const exactQ = {
            $expr: discount_fixed,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
      } else {
        const exactQ = { collections: { $in: [product_collection._id] } };
        searchParams = { ...searchParams, ...exactQ };
      }
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('collections')
      .populate('product_category')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      products,
      product_collection,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsByCollectionHomepage = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['featured'] = true;
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    if (req.query.min_price && req.query.max_price) {
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    // Block to get Collection Details
    const product_collection = await Collection.findOne({
      slug: req.params.slug,
    });
    if (product_collection) {
      if (product_collection.is_dynamic_collection) {
        // Conditions Check
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'PRICE'
        ) {
          const sale_price = {};
          sale_price[`${product_collection.dynamic_collection.condition}`] =
            product_collection.dynamic_collection.value;
          const exactQ = {
            sale_price: sale_price,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'DISCOUNT_FIXED'
        ) {
          const discount_fixed = {};
          discount_fixed[`${product_collection.dynamic_collection.condition}`] =
            [
              { $subtract: ['$regular_price', '$sale_price'] },
              product_collection.dynamic_collection.value,
            ];
          // { $eq: [ { $multiply: ["$PrecioCantidad", "$Cantidad"]} ], 1000}

          const exactQ = {
            $expr: discount_fixed,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
        if (
          product_collection.dynamic_collection &&
          product_collection.dynamic_collection.field == 'DISCOUNT_PERCENTAGE'
        ) {
          const discount_fixed = {};
          discount_fixed[`${product_collection.dynamic_collection.condition}`] =
            [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$regular_price', '$sale_price'] },
                      '$regular_price',
                    ],
                  },
                  100,
                ],
              },
              product_collection.dynamic_collection.value,
            ];
          // { $eq: [ { $multiply: ["$PrecioCantidad", "$Cantidad"]} ], 1000}

          const exactQ = {
            $expr: discount_fixed,
          };
          searchParams = { ...searchParams, ...exactQ };
        }
      } else {
        const exactQ = { collections: { $in: [product_collection._id] } };
        searchParams = { ...searchParams, ...exactQ };
      }
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));

    const products = await Product.find({ ...searchParams })
      .limit(10)
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('collections')
      .populate('product_category')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .sort({ published_date: -1 });

    res.json({
      products,
      product_collection,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }

    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    // Block to get Collection Details
    const product_category = await Productcategory.findOne({
      slug: req.params.cat,
    });
    if (product_category) {
      const exactQ = { product_category: product_category._id };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }
    console.log('Query', req.query);
    if (req.query.min_price && req.query.max_price) {
      console.log('Check if working');
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      products,
      product_category,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsByVendor = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.min_price && req.query.max_price) {
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    // Block to get Collection Details
    const user = await User.findById(req.params.vendor);
    if (user) {
      const exactQ = { vendor: user._id };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    // Products
    const filteredProducts = products.filter((product) => {
      return product.vendor && product.vendor !== null;
    });
    // console.log('filteredProducts');
    res.json({
      products: filteredProducts,
      vendor: user,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsBySubCategory = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.min_price && req.query.max_price) {
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    const product_category = await Productcategory.findOne({
      slug: req.params.cat,
    });
    // Block to get Collection Details
    const sub_category = await SubCategory.findOne({
      slug: req.params.sub_cat,
      category: product_category._id,
    });
    if (product_category && sub_category) {
      const exactQ = {
        product_category: product_category._id,
        sub_category: sub_category._id,
      };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      products,
      sub_category: sub_category,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products By Collection Slug
// @route   GET /api/products
// @access  Public
const getProductsBySubSubCategory = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }

    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    const product_category = await Productcategory.findOne({
      slug: req.params.cat,
    });
    // Block to get Collection Details
    const sub_category = await SubCategory.findOne({
      slug: req.params.sub_cat,
      category: product_category._id,
    });
    // Block to get Collection Details
    const sub_sub_category = await SubSubCategory.findOne({
      slug: req.params.sub_sub_cat,
      sub_category: sub_category._id,
      category: product_category._id,
    });

    if (product_category) {
      const exactQ = {
        sub_sub_category: sub_sub_category._id,
        product_category: product_category._id,
        sub_category: sub_category._id,
      };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }
    if (req.query.min_price && req.query.max_price) {
      console.log('Check Min price');
      const conditional = {
        sale_price: {
          $gte: req.query.min_price,
          $lte: req.query.max_price,
        },
      };
      searchParams = { ...searchParams, ...conditional };
    }
    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      products,
      sub_sub_category: sub_sub_category,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';

    // Add vendor filter if provided
    if (req.query.vendor) {
      searchParams['vendor'] = req.query.vendor;
    }

    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const products = await Product.find({ ...searchParams })
      .populate({
        path: 'tyre',
        populate: [
          { path: 'rimDiameter', select: '_id name' },
          { path: 'tyreWidth', select: '_id name' },
          { path: 'aspectRatio', select: '_id name' },
          { path: 'loadIndex', select: '_id name' },
          { path: 'speedSymbol', select: '_id name' },
          { path: 'plyRating', select: '_id name' },
          { path: 'productBrand', select: '_id name' },
          { path: 'productThreadPattern', select: '_id name' },
          { path: 'productType', select: '_id name' },
          { path: 'created_by', select: '_id name' },
          { path: 'updated_by', select: '_id name' },
        ],
      })
      .populate({
        path: 'alloy_wheel',
        populate: [
          { path: 'alloyDiameterInches', select: '_id name' },
          { path: 'alloyWidth', select: '_id name' },
          { path: 'alloyPCD', select: '_id name' },
          { path: 'alloyOffset', select: '_id name' },
          { path: 'alloyBoreSizeMM', select: '_id name' },
          { path: 'alloyBrand', select: '_id name' },
          { path: 'alloyFinish', select: '_id name' },
          { path: 'productType', select: '_id name' },
          { path: 'created_by', select: '_id name' },
          { path: 'updated_by', select: '_id name' },
        ],
      })
      .populate({
        path: 'service',
        populate: [{ path: 'productType', select: '_id name' }],
      })
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })

      .limit(1000)
      .skip(1000 * (page - 1))
      .sort({ published_date: -1 });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
const getAllProductsSlug = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';

    const products = await Product.find({ ...searchParams }, { slug: 1 }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ slug: req.params.slug })
      .populate('collections')
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })
      .populate('product_category')
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      });
    if (products.length > 0) {
      const relatedProducts = await Product.find({
        sub_sub_category: products[0].sub_sub_category,
        product_status: 'Active',
      })
        .limit(10)
        .sort({ published_date: -1 });
      res.json({ product: products[0], relatedProducts: relatedProducts });
    } else {
      res.status(502);
      throw new Error('No Product Find');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'tyre',
        populate: [
          { path: 'rimDiameter', select: '_id name' },
          { path: 'tyreWidth', select: '_id name' },
          { path: 'aspectRatio', select: '_id name' },
          { path: 'loadIndex', select: '_id name' },
          { path: 'speedSymbol', select: '_id name' },
          { path: 'plyRating', select: '_id name' },
          { path: 'productBrand', select: '_id name' },
          { path: 'productThreadPattern', select: '_id name' },
          { path: 'productType', select: '_id name' },
          { path: 'created_by', select: '_id name' },
          { path: 'updated_by', select: '_id name' },
        ],
      })
      .populate({
        path: 'vendor',
        match: { 'vendor.profile_status': { $eq: 'APPROVED' } },
      })

      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (product && product.published_status === 'PUBLISHED') {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.remove();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteBulkProduct = asyncHandler(async (req, res) => {
  try {
    console.log('IDS', req.body.products);
    const product = await Product.deleteMany({
      _id: {
        $in: req.body.products,
      },
    });
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);

    if (req.user) {
      data.created_by = req.user._id;
      // MANDATORY Isolation: Vendors can ONLY create products for themselves
      if (req.user.role === 'VENDOR') {
        data.vendor = req.user._id;
      } else {
        data.vendor = req.body.vendor ? req.body.vendor : req.user._id;
      }
    }
    console.log('data', data, req?.body);

    const product = new Product(data);
    const createdProduct = await product.save();
    const newData = await Product.findById(createdProduct._id);
    newData.slug = `${newData.slug}-${newData.product_id}`;
    const updatedProduct = await newData.save();
    res.status(201).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  try {
    let feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    console.log('FEED', feed);
    const data = await Product.findById(req.params.id);
    if (!data) {
      res.status(404);
      throw new Error('Product not found');
    }

    // MANDATORY Isolation: Vendors can only update THEIR products
    if (req.user && req.user.role === 'VENDOR') {
      const isOwner = data.created_by?.toString() === req.user._id.toString() || 
                      data.vendor?.toString() === req.user._id.toString();
      if (!isOwner) {
        res.status(401);
        throw new Error('Not authorized to update this product');
      }
      // Vendors cannot change the vendor field
      delete feed.vendor;
    }

    if (data) {
      Object.keys(feed).map((item) => {
        data[item] = feed[item];
      });
      delete data.slug;

      const updatedProduct = await data.save();
      res.json(updatedProduct);
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProductCategory = asyncHandler(async (req, res) => {
  try {
    // console.log('FEED', feed);
    const data = await Product.findById(req.params.id);
    if (data) {
      data.sub_category = req.body.sub_category;
      const updatedProduct = await data.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error(error);
  }
});

// @desc    delate  product from backup
// @route   PUT /api/products/:id
// @access  Private
const deleteProductsBackup = asyncHandler(async (req, res) => {
  try {
    const deletedProducts = await Product.deleteMany({
      product_default_id: { $exists: true },
    });
    res.json(deletedProducts);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
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
        populate: [{ path: 'productType', select: 'name' }],
      };

    default:
      return {};
  }
}

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getAllProducts,
  getProductBySlug,
  getProductsByCollection,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductsBySubSubCategory,
  deleteBulkProduct,
  getProductsByCollectionHomepage,
  deleteProductsBackup,
  getProductsByVendor,
  getAllProductsSlug,
  updateProductCategory,
  getProductsBulk,
};
