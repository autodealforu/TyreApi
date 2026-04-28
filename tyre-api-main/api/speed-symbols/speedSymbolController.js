import asyncHandler from 'express-async-handler';
import SpeedSymbol from './speedSymbolModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all speedSymbols
// @route   GET /api/speedSymbols
// @access  Public
const getSpeedSymbols = asyncHandler(async (req, res) => {
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
    const count = await SpeedSymbol.countDocuments({ ...searchParams });
    const speedSymbols = await SpeedSymbol.find({ ...searchParams })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      speedSymbols,
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
// @desc    Fetch all speedSymbols
// @route   GET /api/speedSymbols/all
// @access  Public
const getAllSpeedSymbols = asyncHandler(async (req, res) => {
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
    const speedSymbols = await SpeedSymbol.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(speedSymbols);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single speedSymbol
// @route   GET /api/speedSymbols/:id
// @access  Public
const getSpeedSymbolById = asyncHandler(async (req, res) => {
  try {
    const speedSymbol = await SpeedSymbol.findById(req.params.id);

    if (speedSymbol && speedSymbol.published_status === 'PUBLISHED') {
      res.json(speedSymbol);
    } else {
      res.status(404);
      throw new Error('Speed Symbol not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Fetch single speedSymbol
// @route   GET /api/speedSymbols/:slug
// @access  Public
const getSpeedSymbolBySlug = asyncHandler(async (req, res) => {
  try {
    const speedSymbol = await SpeedSymbol.findOne({ slug: req.params.slug });
    res.json(speedSymbol);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Delete a speedSymbol
// @route   DELETE /api/speedSymbols/:id
// @access  Private/Admin
const deleteSpeedSymbol = asyncHandler(async (req, res) => {
  try {
    const speedSymbol = await SpeedSymbol.findById(req.params.id);

    if (speedSymbol) {
      await speedSymbol.remove();
      res.json({ message: 'Speed Symbol removed' });
    } else {
      res.status(404);
      throw new Error('Speed Symbol not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a speedSymbol
// @route   POST /api/speedSymbols
// @access  Private/Admin
const createSpeedSymbol = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const speedSymbol = new SpeedSymbol(data);
    const createdSpeedSymbol = await speedSymbol.save();
    res.status(201).json(createdSpeedSymbol);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a speedSymbol
// @route   PUT /api/speedSymbols/:id
// @access  Private
const updateSpeedSymbol = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }
    const data = await SpeedSymbol.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedSpeedSymbol = await data.save();
      res.json(updatedSpeedSymbol);
    } else {
      res.status(404);
      throw new Error('Speed Symbol not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getSpeedSymbols,
  getSpeedSymbolById,
  getSpeedSymbolBySlug,
  deleteSpeedSymbol,
  createSpeedSymbol,
  updateSpeedSymbol,
  getAllSpeedSymbols,
};
