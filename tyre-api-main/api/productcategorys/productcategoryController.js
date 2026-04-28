import asyncHandler from 'express-async-handler';
import Productcategory from './ProductcategoryModel.js';
import checkRequired from '../../utils/checkRequired.js';
import SubCategory from '../subcategorys/SubCategoryModel.js';
import SubSubCategory from '../subsubcategorys/SubSubCategoryModel.js';

// @desc    Fetch all productcategorys
// @route   GET /api/productcategorys
// @access  Public
const getProductcategorys = asyncHandler(async (req, res) => {
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
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    const count = await Productcategory.countDocuments({ ...searchParams });
    const productcategorys = await Productcategory.find({ ...searchParams })
      .limit(pageSize)
      .populate('product_collection')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      productcategorys,
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

const getProductcategorysAll = asyncHandler(async (req, res) => {
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
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    const count = await Productcategory.countDocuments({ ...searchParams });
    const productcategorys = await Productcategory.find({ ...searchParams })
      .limit(pageSize)
      .populate('product_collection')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ published_date: -1 });

    res.json({
      productcategorys,
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
// @desc    Fetch all productcategorys
// @route   GET /api/productcategorys/all
// @access  Public
const getAllProductcategorys = asyncHandler(async (req, res) => {
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
    const productcategorys = await Productcategory.find({ ...searchParams })
      .populate('product_collection')
      .sort({ published_date: -1 });
    res.json(productcategorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all productcategorys
// @route   GET /api/productcategorys/all
// @access  Public
const getAllProductCategoriesHomepage = asyncHandler(async (req, res) => {
  try {
    const productCategories = await Productcategory.find().sort({
      published_date: -1,
    });
    const subCategories = await SubCategory.find().sort({
      published_date: -1,
    });
    const subSubCategories = await SubSubCategory.find().sort({
      published_date: -1,
    });
    res.json({ productCategories, subCategories, subSubCategories });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single productcategory
// @route   GET /api/productcategorys/:id
// @access  Public
const getProductcategoryById = asyncHandler(async (req, res) => {
  try {
    const productcategory = await Productcategory.findById(req.params.id)
      .populate('product_collection')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (productcategory && productcategory.published_status === 'PUBLISHED') {
      res.json(productcategory);
    } else {
      res.status(404);
      throw new Error('Productcategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a productcategory
// @route   DELETE /api/productcategorys/:id
// @access  Private/Admin
const deleteProductcategory = asyncHandler(async (req, res) => {
  try {
    const productcategory = await Productcategory.findById(req.params.id);

    if (productcategory) {
      await productcategory.remove();
      res.json({ message: 'Productcategory removed' });
    } else {
      res.status(404);
      throw new Error('Productcategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a productcategory
// @route   POST /api/productcategorys
// @access  Private/Admin
const createProductcategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const productcategory = new Productcategory(data);
    const createdProductcategory = await productcategory.save();
    res.status(201).json(createdProductcategory);
  } catch (error) {
    console.log('Error', error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a productcategory
// @route   PUT /api/productcategorys/:id
// @access  Private
const updateProductcategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Productcategory.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedProductcategory = await data.save();
      res.json(updatedProductcategory);
    } else {
      res.status(404);
      throw new Error('Productcategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getProductcategorys,
  getProductcategoryById,
  deleteProductcategory,
  createProductcategory,
  updateProductcategory,
  getAllProductcategorys,
  getAllProductCategoriesHomepage,
};
