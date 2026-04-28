import asyncHandler from 'express-async-handler';
import AspectRatio from './aspectRatioModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all aspectRatios
// @route   GET /api/aspectRatios
// @access  Public
const getAspectRatios = asyncHandler(async (req, res) => {
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
    const count = await AspectRatio.countDocuments({ ...searchParams });
    const aspectRatios = await AspectRatio.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      aspectRatios,
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
// @desc    Fetch all aspectRatios
// @route   GET /api/aspectRatios/all
// @access  Public
const getAllAspectRatios = asyncHandler(async (req, res) => {
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
    const aspectRatios = await AspectRatio.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(aspectRatios);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single aspectRatio
// @route   GET /api/aspectRatios/:id
// @access  Public
const getAspectRatioById = asyncHandler(async (req, res) => {
  try {
    const aspectRatio = await AspectRatio.findById(req.params.id);

    if (aspectRatio && aspectRatio.published_status === 'PUBLISHED') {
      res.json(aspectRatio);
    } else {
      res.status(404);
      throw new Error('Aspect Ratio not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single aspectRatio
// @route   GET /api/aspectRatios/:slug
// @access  Public
const getAspectRatioBySlug = asyncHandler(async (req, res) => {
  try {
    const aspectRatio = await AspectRatio.findOne({ slug: req.params.slug });
    res.json(aspectRatio);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a aspectRatio
// @route   DELETE /api/aspectRatios/:id
// @access  Private/Admin
const deleteAspectRatio = asyncHandler(async (req, res) => {
  try {
    const aspectRatio = await AspectRatio.findById(req.params.id);

    if (aspectRatio) {
      await aspectRatio.remove();
      res.json({ message: 'Aspect Ratio removed' });
    } else {
      res.status(404);
      throw new Error('Aspect Ratio not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a aspectRatio
// @route   POST /api/aspectRatios
// @access  Private/Admin
const createAspectRatio = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const aspectRatio = new AspectRatio(data);
    const createdAspectRatio = await aspectRatio.save();
    res.status(201).json(createdAspectRatio);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a aspectRatio
// @route   PUT /api/aspectRatios/:id
// @access  Private
const updateAspectRatio = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await AspectRatio.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedAspectRatio = await data.save();
      res.json(updatedAspectRatio);
    } else {
      res.status(404);
      throw new Error('Aspect Ratio not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getAspectRatios,
  getAspectRatioById,
  getAspectRatioBySlug,
  deleteAspectRatio,
  createAspectRatio,
  updateAspectRatio,
  getAllAspectRatios,
};
