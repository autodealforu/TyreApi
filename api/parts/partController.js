import asyncHandler from 'express-async-handler';
import Part from './PartModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all parts
// @route   GET /api/parts
// @access  Public
const getParts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

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
    const count = await Part.countDocuments({ ...searchParams });
    const parts = await Part.find({ ...searchParams })
      .limit(pageSize)
      .populate('vendor', '_id, name, vendor')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      parts,
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
// @desc    Fetch all parts
// @route   GET /api/parts/all
// @access  Public
const getAllParts = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    if (req?.user?.role === 'VENDOR') {
      searchParams['vendor'] = req.user._id;
    }

    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const parts = await Part.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(parts);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single part
// @route   GET /api/parts/:id
// @access  Public
const getPartById = asyncHandler(async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate(
      'vendor',
      '_id, name, vendor'
    );

    if (part) {
      res.json(part);
    } else {
      res.status(404);
      throw new Error('Part not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a part
// @route   DELETE /api/parts/:id
// @access  Private/Admin
const deletePart = asyncHandler(async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (part) {
      await part.remove();
      res.json({ message: 'Part removed' });
    } else {
      res.status(404);
      throw new Error('Part not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a part
// @route   POST /api/parts
// @access  Private/Admin
const createPart = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.vendor = req.user._id;
    const part = new Part(data);
    const createdPart = await part.save();
    res.status(201).json(createdPart);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a part
// @route   PUT /api/parts/:id
// @access  Private
const updatePart = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);

    const data = await Part.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedPart = await data.save();
      res.json(updatedPart);
    } else {
      res.status(404);
      throw new Error('Part not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getParts,
  getPartById,
  deletePart,
  createPart,
  updatePart,
  getAllParts,
};
