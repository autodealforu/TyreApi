import asyncHandler from 'express-async-handler';
import SubCategory from './SubCategoryModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all subcategorys
// @route   GET /api/subcategorys
// @access  Public
const getSubCategorys = asyncHandler(async (req, res) => {
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
    const count = await SubCategory.countDocuments({ ...searchParams });
    const subcategorys = await SubCategory.find({ ...searchParams })
      .populate('category')
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      subcategorys,
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
// @desc    Fetch all subcategorys
// @route   GET /api/subcategorys/all
// @access  Public
const getAllSubCategorys = asyncHandler(async (req, res) => {
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
    const subcategorys = await SubCategory.find({ ...searchParams }).sort({
      createdAt: -1,
    });
    res.json(subcategorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

const getAllSubCategorysPopulated = asyncHandler(async (req, res) => {
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
    const subcategorys = await SubCategory.find({ ...searchParams })
      .populate('category')
      .sort({
        createdAt: -1,
      });
    res.json(subcategorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single subcategory
// @route   GET /api/subcategorys/:id
// @access  Public
const getSubCategoryById = asyncHandler(async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id)
      .populate('category')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (subcategory && subcategory.published_status === 'PUBLISHED') {
      res.json(subcategory);
    } else {
      res.status(404);
      throw new Error('SubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a subcategory
// @route   DELETE /api/subcategorys/:id
// @access  Private/Admin
const deleteSubCategory = asyncHandler(async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id);

    if (subcategory) {
      await subcategory.remove();
      res.json({ message: 'SubCategory removed' });
    } else {
      res.status(404);
      throw new Error('SubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a subcategory
// @route   POST /api/subcategorys
// @access  Private/Admin
const createSubCategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;
    const subcategory = new SubCategory(data);
    const createdSubCategory = await subcategory.save();
    res.status(201).json(createdSubCategory);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a subcategory
// @route   PUT /api/subcategorys/:id
// @access  Private
const updateSubCategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await SubCategory.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedSubCategory = await data.save();
      res.json(updatedSubCategory);
    } else {
      res.status(404);
      throw new Error('SubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getSubCategorys,
  getSubCategoryById,
  deleteSubCategory,
  createSubCategory,
  updateSubCategory,
  getAllSubCategorys,
  getAllSubCategorysPopulated,
};
