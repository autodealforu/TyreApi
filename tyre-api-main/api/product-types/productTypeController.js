import asyncHandler from 'express-async-handler';
import ProductType from './productTypeModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all productTypes
// @route   GET /api/productTypes
// @access  Public
const getProductTypes = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
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
    if (req.query.term) {
      const searchQ = req.query.term;
      const newQData = { $text: { $search: searchQ } };
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
    const count = await ProductType.countDocuments({ ...searchParams });
    const productTypes = await ProductType.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      productTypes,
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
// @desc    Fetch all productTypes
// @route   GET /api/productTypes/all
// @access  Public
const getAllProductTypes = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const productTypes = await ProductType.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(productTypes);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single productType
// @route   GET /api/productTypes/:id
// @access  Public
const getProductTypeById = asyncHandler(async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);

    if (productType && productType.published_status === 'PUBLISHED') {
      res.json(productType);
    } else {
      res.status(404);
      throw new Error('Product Type not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single productType
// @route   GET /api/productTypes/:slug
// @access  Public
const getProductTypeBySlug = asyncHandler(async (req, res) => {
  try {
    const productType = await ProductType.findOne({ slug: req.params.slug });
    res.json(productType);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a productType
// @route   DELETE /api/productTypes/:id
// @access  Private/Admin
const deleteProductType = asyncHandler(async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);

    if (productType) {
      await productType.remove();
      res.json({ message: 'Product Type removed' });
    } else {
      res.status(404);
      throw new Error('Product Type not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a productType
// @route   POST /api/productTypes
// @access  Private/Admin
const createProductType = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const productType = new ProductType(data);
    const createdProductType = await productType.save();
    res.status(201).json(createdProductType);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a productType
// @route   PUT /api/productTypes/:id
// @access  Private
const updateProductType = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await ProductType.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedProductType = await data.save();
      res.json(updatedProductType);
    } else {
      res.status(404);
      throw new Error('Product Type not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getProductTypes,
  getProductTypeById,
  getProductTypeBySlug,
  deleteProductType,
  createProductType,
  updateProductType,
  getAllProductTypes,
};
