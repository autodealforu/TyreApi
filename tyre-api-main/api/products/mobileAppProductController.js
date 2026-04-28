import asyncHandler from 'express-async-handler';
import Product from './ProductModel.js';
import checkRequired from '../../utils/checkRequired.js';
import Collection from '../collections/CollectionModel.js';
import Productcategory from '../productcategorys/ProductcategoryModel.js';
import SubCategory from '../subcategorys/SubCategoryModel.js';
import SubSubCategory from '../subsubcategorys/SubSubCategoryModel.js';
import User from '../users/UserModel.js';
const getMobileAppProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    // searchParams['published_status'] = 'PUBLISHED';

    if (req.user && req.user.role === 'VENDOR') {
      searchParams['vendor'] = req.user._id;
    }
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
    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved

    console.log('Search Params', searchParams);
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('product_category')
      .populate('sub_category')
      .populate('sub_sub_category')
      .populate('collections')
      .populate('vendor')
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
      products: products,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppProductsByCollection = asyncHandler(async (req, res) => {
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
    const product_collection = await Collection.findById(req.params.id);
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
      // console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('vendor')
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
      products: products,
      product_collection,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppProductsByCollectionHomepage = asyncHandler(
  async (req, res) => {
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
      const product_collection = await Collection.findById(req.params.slug);
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
            discount_fixed[
              `${product_collection.dynamic_collection.condition}`
            ] = [
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
            discount_fixed[
              `${product_collection.dynamic_collection.condition}`
            ] = [
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
        // console.log(error);
        res.status(502);
        throw new Error('Something Went wrong');
      }
      // check if vendor profile is approved
      const vendors = await User.find({
        role: 'VENDOR',
        'vendor.profile_status': 'APPROVED',
      });
      const vendorIds = vendors.map((vendor) => vendor._id);
      searchParams['vendor'] = { $in: vendorIds };
      // End of check if vendor profile is approved

      // End of block to get Collection Details
      console.log('SEARCH PARAMS', JSON.stringify(searchParams));

      const products = await Product.find({ ...searchParams })
        .limit(10)
        .populate('vendor')
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
      // console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }
  }
);

const getMobileAppProductsByCategory = asyncHandler(async (req, res) => {
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
    const product_category = await Productcategory.findById(req.params.id);
    if (product_category) {
      const exactQ = { product_category: product_category._id };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      res.status(502);
    }
    console.log('Query', req.query);
    if (req.query.min_price && req.query.max_price) {
      console.log('Check if working');
      searchParams['sale_price'] = {
        $gte: req.query.min_price,
        $lte: req.query.max_price,
      };
    }
    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate('vendor')
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });
    const filteredData = products.filter(
      (product) =>
        product &&
        product.vendor &&
        product.vendor.vendor &&
        product.vendor.vendor.store_active
    );
    res.json({
      products: filteredData,
      product_category,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppProductsByVendor = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    searchParams['vendor'] = req.params.vendor;
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
      // console.log(error);
      res.status(502);
      throw new Error('Something Went wrong');
    }

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    // check if vendor profile is approved
    // const vendors = await User.find({
    //   role: 'VENDOR',
    //   'vendor.profile_status': 'APPROVED',
    // });
    // const vendorIds = vendors.map((vendor) => vendor._id);
    // searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate('vendor')
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
      products,
      vendor: user,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppProductsBySubCategory = asyncHandler(async (req, res) => {
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

    // Block to get Collection Details
    const sub_category = await SubCategory.findById(req.params.sub_cat);
    if (sub_category) {
      const exactQ = {
        sub_category: sub_category._id,
      };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      // console.log(error);
      res.status(502);
      // throw new Error('Something Went wrong');
    }
    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved

    // End of block to get Collection Details
    console.log('SEARCH PARAMS', JSON.stringify(searchParams));
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate('vendor')
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
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppProductsBySubSubCategory = asyncHandler(async (req, res) => {
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
    const sub_sub_category = await SubSubCategory.findById(
      req.params.sub_sub_cat
    );

    if (sub_sub_category) {
      const exactQ = {
        sub_sub_category: sub_sub_category._id,
      };
      searchParams = { ...searchParams, ...exactQ };
    } else {
      // console.log(error);
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
    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved
    const count = await Product.countDocuments({ ...searchParams });
    const products = await Product.find({ ...searchParams })
      .limit(pageSize)
      .populate('collections')
      .populate('vendor')
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });
    const filteredData = products.filter(
      (product) =>
        product &&
        product.vendor &&
        product.vendor.vendor &&
        product.vendor.vendor.store_active
    );

    res.json({
      products,
      sub_sub_category: sub_sub_category,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getMobileAppAllProducts = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    // check if vendor profile is approved
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    searchParams['vendor'] = { $in: vendorIds };
    // End of check if vendor profile is approved
    const products = await Product.find({ ...searchParams })
      .populate('collections')
      .populate('vendor')
      .populate('categories')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .limit(1000)
      .skip(1000 * (page - 1))
      .sort({ published_date: -1 });
    const filteredData = products.filter(
      (product) =>
        product &&
        product.vendor &&
        product.vendor.vendor &&
        product.vendor.vendor.store_active
    );
    res.json({ products });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
const getMobileAppAllProductsSlug = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';

    const products = await Product.find({ ...searchParams }, { slug: 1 }).sort({
      createdAt: -1,
    });
    const filteredData = products.filter(
      (product) =>
        product &&
        product.vendor &&
        product.vendor.vendor &&
        product.vendor.vendor.store_active
    );
    res.json({ products });
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Public
const getMobileAppProductBySlug = asyncHandler(async (req, res) => {
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
      if (!products[0].vendor) {
        res.status(502);
        throw new Error('No Product Find');
      }
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
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getMobileAppProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
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
    if (product) {
      if (!product.vendor) {
        res.status(502);
        throw new Error('No Product Find');
      }
      const relatedProducts = await Product.find({
        sub_sub_category: product.sub_sub_category,
        product_status: 'Active',
      })
        .limit(10)
        .sort({ published_date: -1 });

      const grouped_products = await Product.find({
        product_category: product.product_category._id,
        product_status: 'Active',
      })
        .limit(10)
        .sort({ published_date: -1 });

      res.json({
        product: product,
        relatedProducts: relatedProducts,
        grouped_products: grouped_products,
      });
    } else {
      res.status(502);
      throw new Error('No Product Find');
    }
  } catch (error) {
    // console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

export {
  getMobileAppProducts,
  getMobileAppProductsByCollection,
  getMobileAppProductsByCollectionHomepage,
  getMobileAppProductsByCategory,
  getMobileAppProductsByVendor,
  getMobileAppProductsBySubCategory,
  getMobileAppProductsBySubSubCategory,
  getMobileAppAllProducts,
  getMobileAppAllProductsSlug,
  getMobileAppProductBySlug,
  getMobileAppProductById,
};
