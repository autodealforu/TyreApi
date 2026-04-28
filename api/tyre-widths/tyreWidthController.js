import asyncHandler from 'express-async-handler';
import TyreWidth from './tyreWidthModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all tyreWidths
// @route   GET /api/tyreWidths
// @access  Public
const getTyreWidths = asyncHandler(async (req, res) => {
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
    const count = await TyreWidth.countDocuments({ ...searchParams });
    const tyreWidths = await TyreWidth.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      tyreWidths,
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
// @desc    Fetch all tyreWidths
// @route   GET /api/tyreWidths/all
// @access  Public
const getAllTyreWidths = asyncHandler(async (req, res) => {
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
    const tyreWidths = await TyreWidth.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(tyreWidths);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single tyreWidth
// @route   GET /api/tyreWidths/:id
// @access  Public
const getTyreWidthById = asyncHandler(async (req, res) => {
  try {
    const tyreWidth = await TyreWidth.findById(req.params.id);

    if (tyreWidth && tyreWidth.published_status === 'PUBLISHED') {
      res.json(tyreWidth);
    } else {
      res.status(404);
      throw new Error('Tyre Width not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single tyreWidth
// @route   GET /api/tyreWidths/:slug
// @access  Public
const getTyreWidthBySlug = asyncHandler(async (req, res) => {
  try {
    const tyreWidth = await TyreWidth.findOne({ slug: req.params.slug });
    res.json(tyreWidth);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a tyreWidth
// @route   DELETE /api/tyreWidths/:id
// @access  Private/Admin
const deleteTyreWidth = asyncHandler(async (req, res) => {
  try {
    const tyreWidth = await TyreWidth.findById(req.params.id);

    if (tyreWidth) {
      await tyreWidth.remove();
      res.json({ message: 'Tyre Width removed' });
    } else {
      res.status(404);
      throw new Error('Tyre Width not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a tyreWidth
// @route   POST /api/tyreWidths
// @access  Private/Admin
const createTyreWidth = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const tyreWidth = new TyreWidth(data);
    const createdTyreWidth = await tyreWidth.save();
    res.status(201).json(createdTyreWidth);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a tyreWidth
// @route   PUT /api/tyreWidths/:id
// @access  Private
const updateTyreWidth = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await TyreWidth.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedTyreWidth = await data.save();
      res.json(updatedTyreWidth);
    } else {
      res.status(404);
      throw new Error('Tyre Width not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getTyreWidths,
  getTyreWidthById,
  getTyreWidthBySlug,
  deleteTyreWidth,
  createTyreWidth,
  updateTyreWidth,
  getAllTyreWidths,
};
