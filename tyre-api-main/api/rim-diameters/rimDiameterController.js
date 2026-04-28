import asyncHandler from 'express-async-handler';
import RimDiameter from './rimDiameterModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all rimDiameters
// @route   GET /api/rimDiameters
// @access  Public
const getRimDiameters = asyncHandler(async (req, res) => {
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
    const count = await RimDiameter.countDocuments({ ...searchParams });
    const rimDiameters = await RimDiameter.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      rimDiameters,
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
// @desc    Fetch all rimDiameters
// @route   GET /api/rimDiameters/all
// @access  Public
const getAllRimDiameters = asyncHandler(async (req, res) => {
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
    const rimDiameters = await RimDiameter.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(rimDiameters);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single rimDiameter
// @route   GET /api/rimDiameters/:id
// @access  Public
const getRimDiameterById = asyncHandler(async (req, res) => {
  try {
    const rimDiameter = await RimDiameter.findById(req.params.id);

    if (rimDiameter && rimDiameter.published_status === 'PUBLISHED') {
      res.json(rimDiameter);
    } else {
      res.status(404);
      throw new Error('Rim Diameter not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single rimDiameter
// @route   GET /api/rimDiameters/:slug
// @access  Public
const getRimDiameterBySlug = asyncHandler(async (req, res) => {
  try {
    const rimDiameter = await RimDiameter.findOne({ slug: req.params.slug });
    res.json(rimDiameter);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a rimDiameter
// @route   DELETE /api/rimDiameters/:id
// @access  Private/Admin
const deleteRimDiameter = asyncHandler(async (req, res) => {
  try {
    const rimDiameter = await RimDiameter.findById(req.params.id);

    if (rimDiameter) {
      await rimDiameter.remove();
      res.json({ message: 'Rim Diameter removed' });
    } else {
      res.status(404);
      throw new Error('Rim Diameter not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a rimDiameter
// @route   POST /api/rimDiameters
// @access  Private/Admin
const createRimDiameter = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const rimDiameter = new RimDiameter(data);
    const createdRimDiameter = await rimDiameter.save();
    res.status(201).json(createdRimDiameter);
  } catch (error) {
    console.log('Error', error);

    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a rimDiameter
// @route   PUT /api/rimDiameters/:id
// @access  Private
const updateRimDiameter = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await RimDiameter.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedRimDiameter = await data.save();
      res.json(updatedRimDiameter);
    } else {
      res.status(404);
      throw new Error('Rim Diameter not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getRimDiameters,
  getRimDiameterById,
  getRimDiameterBySlug,
  deleteRimDiameter,
  createRimDiameter,
  updateRimDiameter,
  getAllRimDiameters,
};
