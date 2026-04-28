import asyncHandler from 'express-async-handler';
import Tyre from './TyreModel.js';
import checkRequired from '../../utils/checkRequired.js';
import mongoose from 'mongoose';

// @desc    Fetch all tyres
// @route   GET /api/tyres
// @access  Public
const getTyres = asyncHandler(async (req, res) => {
  try {
    const pageTyre = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';

    // MANDATORY Isolation logic: Vendors ONLY see their own records
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['created_by'] = mongoose.Types.ObjectId(req.user._id);
    }

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
    const count = await Tyre.countDocuments({ ...searchParams });
    const tyres = await Tyre.find({ ...searchParams })
      .limit(pageTyre)

      .populate('rimDiameter', '_id, name')
      .populate('tyreWidth', '_id, name')
      .populate('aspectRatio', '_id, name')
      .populate('loadIndex', '_id, name')
      .populate('speedSymbol', '_id, name')
      .populate('plyRating', '_id, name')
      .populate('productBrand', '_id, name')
      .populate('productThreadPattern', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageTyre * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ tyres, page, pages: Math.ceil(count / pageTyre), count: count });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
// @desc    Fetch all tyres
// @route   GET /api/tyres/all
// @access  Public
const getAllTyres = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    // MANDATORY Isolation logic: Vendors ONLY see their own records
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['created_by'] = mongoose.Types.ObjectId(req.user._id);
    }

    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const tyres = await Tyre.find({ ...searchParams })
      .populate('rimDiameter', '_id, name')
      .populate('tyreWidth', '_id, name')
      .populate('aspectRatio', '_id, name')
      .populate('loadIndex', '_id, name')
      .populate('speedSymbol', '_id, name')
      .populate('plyRating', '_id, name')
      .populate('productBrand', '_id, name')
      .populate('productThreadPattern', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(tyres);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single tyre
// @route   GET /api/tyres/:id
// @access  Public
const getTyreById = asyncHandler(async (req, res) => {
  try {
    const tyre = await Tyre.findById(req.params.id)
      .populate('rimDiameter', '_id, name')
      .populate('tyreWidth', '_id, name')
      .populate('aspectRatio', '_id, name')
      .populate('loadIndex', '_id, name')
      .populate('speedSymbol', '_id, name')
      .populate('plyRating', '_id, name')
      .populate('productBrand', '_id, name')
      .populate('productThreadPattern', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (tyre && tyre.published_status === 'PUBLISHED') {
      res.json(tyre);
    } else {
      res.status(404);
      throw new Error('Tyre not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a tyre
// @route   DELETE /api/tyres/:id
// @access  Private/Admin
const deleteTyre = asyncHandler(async (req, res) => {
  try {
    const tyre = await Tyre.findById(req.params.id);

    if (tyre) {
      if (req.user && req.user.role === 'VENDOR' && tyre.created_by?.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this tyre');
      }
      await tyre.remove();
      res.json({ message: 'Tyre removed' });
    } else {
      res.status(404);
      throw new Error('Tyre not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a tyre
// @route   POST /api/tyres
// @access  Private/Admin
const createTyre = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);

    console.log('data', data, req?.body);

    data.created_by = req.user._id;
    const tyre = new Tyre(data);
    const createdTyre = await tyre.save();
    res.status(201).json(createdTyre);
  } catch (error) {
    console.log('Error in createTyre:', error);

    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a tyre
// @route   PUT /api/tyres/:id
// @access  Private
const updateTyre = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await Tyre.findById(req.params.id);
    if (data) {
      if (req.user && req.user.role === 'VENDOR' && data.created_by?.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this tyre');
      }
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedTyre = await data.save();
      res.json(updatedTyre);
    } else {
      res.status(404);
      throw new Error('Tyre not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getTyres,
  getTyreById,
  deleteTyre,
  createTyre,
  updateTyre,
  getAllTyres,
};
