import asyncHandler from 'express-async-handler';
import LoadIndex from './loadIndexModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all loadIndexs
// @route   GET /api/loadIndexs
// @access  Public
const getLoadIndexes = asyncHandler(async (req, res) => {
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
    const count = await LoadIndex.countDocuments({ ...searchParams });
    const loadIndexes = await LoadIndex.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      loadIndexes,
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
// @desc    Fetch all loadIndexs
// @route   GET /api/loadIndexs/all
// @access  Public
const getAllLoadIndexes = asyncHandler(async (req, res) => {
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
    const loadIndexes = await LoadIndex.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });

    res.json(loadIndexes);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single loadIndex
// @route   GET /api/loadIndexs/:id
// @access  Public
const getLoadIndexById = asyncHandler(async (req, res) => {
  try {
    const loadIndex = await LoadIndex.findById(req.params.id);

    if (loadIndex && loadIndex.published_status === 'PUBLISHED') {
      res.json(loadIndex);
    } else {
      res.status(404);
      throw new Error('Load Index not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single loadIndex
// @route   GET /api/loadIndexes/:slug
// @access  Public
const getLoadIndexBySlug = asyncHandler(async (req, res) => {
  try {
    const loadIndex = await LoadIndex.findOne({ slug: req.params.slug });
    res.json(loadIndex);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a loadIndex
// @route   DELETE /api/loadIndexes/:id
// @access  Private/Admin
const deleteLoadIndex = asyncHandler(async (req, res) => {
  try {
    const loadIndex = await LoadIndex.findById(req.params.id);

    if (loadIndex) {
      await loadIndex.remove();
      res.json({ message: 'Load Index removed' });
    } else {
      res.status(404);
      throw new Error('Load Index not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a loadIndex
// @route   POST /api/loadIndexs
// @access  Private/Admin
const createLoadIndex = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const loadIndex = new LoadIndex(data);
    const createdLoadIndex = await loadIndex.save();
    res.status(201).json(createdLoadIndex);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a loadIndex
// @route   PUT /api/loadIndexes/:id
// @access  Private
const updateLoadIndex = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await LoadIndex.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedLoadIndex = await data.save();
      res.json(updatedLoadIndex);
    } else {
      res.status(404);
      throw new Error('Load Index not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getLoadIndexes,
  getLoadIndexById,
  getLoadIndexBySlug,
  deleteLoadIndex,
  createLoadIndex,
  updateLoadIndex,
  getAllLoadIndexes,
};
