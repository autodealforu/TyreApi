import asyncHandler from 'express-async-handler';
import ThreadPattern from './threadPatternModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all threadPatterns
// @route   GET /api/threadPatterns
// @access  Public
const getThreadPatterns = asyncHandler(async (req, res) => {
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
    const count = await ThreadPattern.countDocuments({ ...searchParams });
    const threadPatterns = await ThreadPattern.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      threadPatterns,
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
// @desc    Fetch all threadPatterns
// @route   GET /api/threadPatterns/all
// @access  Public
const getAllThreadPatterns = asyncHandler(async (req, res) => {
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
    const threadPatterns = await ThreadPattern.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(threadPatterns);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single threadPattern
// @route   GET /api/threadPatterns/:id
// @access  Public
const getThreadPatternById = asyncHandler(async (req, res) => {
  try {
    const threadPattern = await ThreadPattern.findById(req.params.id);

    if (threadPattern && threadPattern.published_status === 'PUBLISHED') {
      res.json(threadPattern);
    } else {
      res.status(404);
      throw new Error('Thread Pattern not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single threadPattern
// @route   GET /api/threadPatterns/:slug
// @access  Public
const getThreadPatternBySlug = asyncHandler(async (req, res) => {
  try {
    const threadPattern = await ThreadPattern.findOne({
      slug: req.params.slug,
    });
    res.json(threadPattern);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a threadPattern
// @route   DELETE /api/threadPatterns/:id
// @access  Private/Admin
const deleteThreadPattern = asyncHandler(async (req, res) => {
  try {
    const threadPattern = await ThreadPattern.findById(req.params.id);

    if (threadPattern) {
      await threadPattern.remove();
      res.json({ message: 'Thread Pattern removed' });
    } else {
      res.status(404);
      throw new Error('Thread Pattern not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a threadPattern
// @route   POST /api/threadPatterns
// @access  Private/Admin
const createThreadPattern = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const threadPattern = new ThreadPattern(data);
    const createdThreadPattern = await threadPattern.save();
    res.status(201).json(createdThreadPattern);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a threadPattern
// @route   PUT /api/threadPatterns/:id
// @access  Private
const updateThreadPattern = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await ThreadPattern.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedThreadPattern = await data.save();
      res.json(updatedThreadPattern);
    } else {
      res.status(404);
      throw new Error('Thread Pattern not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getThreadPatterns,
  getThreadPatternById,
  getThreadPatternBySlug,
  deleteThreadPattern,
  createThreadPattern,
  updateThreadPattern,
  getAllThreadPatterns,
};
