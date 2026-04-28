import asyncHandler from 'express-async-handler';
import Category from './CategoryModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all categorys
// @route   GET /api/categorys
// @access  Public
const getCategorys = asyncHandler(async (req, res) => {
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
    const count = await Category.countDocuments({ ...searchParams });
    const categorys = await Category.find({ ...searchParams })
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      categorys,
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
// @desc    Fetch all categorys
// @route   GET /api/categorys/all
// @access  Public
const getAllCategorys = asyncHandler(async (req, res) => {
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
    const categorys = await Category.find({ ...searchParams }).sort({
      createdAt: -1,
    });
    res.json(categorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single category
// @route   GET /api/categorys/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (category && category.published_status === 'PUBLISHED') {
      res.json(category);
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categorys/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (category) {
      res.json({ message: 'Category removed' });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a category
// @route   POST /api/categorys
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const category = new Category(data);
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a category
// @route   PUT /api/categorys/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Category.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedCategory = await data.save();
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getCategorys,
  getCategoryById,
  deleteCategory,
  createCategory,
  updateCategory,
  getAllCategorys,
};
