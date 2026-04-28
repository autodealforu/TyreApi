import asyncHandler from 'express-async-handler';
import SubSubCategory from './SubSubCategoryModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all subsubcategorys
// @route   GET /api/subsubcategorys
// @access  Public
const getSubSubCategorys = asyncHandler(async (req, res) => {
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
    const count = await SubSubCategory.countDocuments({ ...searchParams });
    const subsubcategorys = await SubSubCategory.find({ ...searchParams })
      .populate('category')
      .populate('sub_category')
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      subsubcategorys,
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
// @desc    Fetch all subsubcategorys
// @route   GET /api/subsubcategorys/all
// @access  Public
const getAllSubSubCategorys = asyncHandler(async (req, res) => {
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
    const subsubcategorys = await SubSubCategory.find({ ...searchParams }).sort(
      { createdAt: -1 }
    );
    res.json(subsubcategorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
// @desc    Fetch all subsubcategorys
// @route   GET /api/subsubcategorys/all
// @access  Public
const getAllSubSubCategorysByPopulate = asyncHandler(async (req, res) => {
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
    const subsubcategorys = await SubSubCategory.find({ ...searchParams })
      .populate('category')
      .populate('sub_category')
      .sort({ createdAt: -1 });
    res.json(subsubcategorys);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single subsubcategory
// @route   GET /api/subsubcategorys/:id
// @access  Public
const getSubSubCategoryById = asyncHandler(async (req, res) => {
  try {
    const subsubcategory = await SubSubCategory.findById(req.params.id)
      .populate('category')
      .populate('sub_category')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (subsubcategory && subsubcategory.published_status === 'PUBLISHED') {
      res.json(subsubcategory);
    } else {
      res.status(404);
      throw new Error('SubSubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a subsubcategory
// @route   DELETE /api/subsubcategorys/:id
// @access  Private/Admin
const deleteSubSubCategory = asyncHandler(async (req, res) => {
  try {
    const subsubcategory = await SubSubCategory.findById(req.params.id);

    if (subsubcategory) {
      await subsubcategory.remove();
      res.json({ message: 'SubSubCategory removed' });
    } else {
      res.status(404);
      throw new Error('SubSubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a subsubcategory
// @route   POST /api/subsubcategorys
// @access  Private/Admin
const createSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;
    const subsubcategory = new SubSubCategory(data);
    const createdSubSubCategory = await subsubcategory.save();
    res.status(201).json(createdSubSubCategory);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a subsubcategory
// @route   PUT /api/subsubcategorys/:id
// @access  Private
const updateSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await SubSubCategory.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedSubSubCategory = await data.save();
      res.json(updatedSubSubCategory);
    } else {
      res.status(404);
      throw new Error('SubSubCategory not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getSubSubCategorys,
  getSubSubCategoryById,
  deleteSubSubCategory,
  createSubSubCategory,
  updateSubSubCategory,
  getAllSubSubCategorys,
  getAllSubSubCategorysByPopulate,
};
