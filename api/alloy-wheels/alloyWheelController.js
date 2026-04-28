import asyncHandler from 'express-async-handler';
import AlloyWheel from './alloyWheelModel.js';
import checkRequired from '../../utils/checkRequired.js';
import mongoose from 'mongoose';

// @desc    Fetch all alloy wheels
// @route   GET /api/alloy-wheels
// @access  Public
const getAlloyWheels = asyncHandler(async (req, res) => {
  try {
    const pageAlloyWheel = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';

    // MANDATORY Isolation logic: Vendors ONLY see their own records
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['created_by'] = req.user._id;
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
    const count = await AlloyWheel.countDocuments({ ...searchParams });
    const alloyWheels = await AlloyWheel.find({ ...searchParams })
      .limit(pageAlloyWheel)
      .populate('alloyDiameterInches', '_id, name')
      .populate('alloyWidth', '_id, name')
      .populate('alloyPCD', '_id, name')
      .populate('alloyOffset', '_id, name')
      .populate('alloyBoreSizeMM', '_id, name')
      .populate('alloyBrand', '_id, name')
      .populate('alloyFinish', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageAlloyWheel * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      alloyWheels,
      page,
      pages: Math.ceil(count / pageAlloyWheel),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch all alloy wheels
// @route   GET /api/alloy-wheels/all
// @access  Public
const getAllAlloyWheels = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    // MANDATORY Isolation logic: Vendors ONLY see their own records
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['created_by'] = req.user._id;
    }

    if (req.query.term && req.query.value) {
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const alloyWheels = await AlloyWheel.find({ ...searchParams })
      .populate('alloyDiameterInches', '_id, name')
      .populate('alloyWidth', '_id, name')
      .populate('alloyPCD', '_id, name')
      .populate('alloyOffset', '_id, name')
      .populate('alloyBoreSizeMM', '_id, name')
      .populate('alloyBrand', '_id, name')
      .populate('alloyFinish', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(alloyWheels);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single alloy wheel
// @route   GET /api/alloy-wheels/:id
// @access  Public
const getAlloyWheelById = asyncHandler(async (req, res) => {
  try {
    const alloyWheel = await AlloyWheel.findById(req.params.id)
      .populate('alloyDiameterInches', '_id, name')
      .populate('alloyWidth', '_id, name')
      .populate('alloyPCD', '_id, name')
      .populate('alloyOffset', '_id, name')
      .populate('alloyBoreSizeMM', '_id, name')
      .populate('alloyBrand', '_id, name')
      .populate('alloyFinish', '_id, name')
      .populate('productType', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (alloyWheel && alloyWheel.published_status === 'PUBLISHED') {
      res.json(alloyWheel);
    } else {
      res.status(404);
      throw new Error('Alloy Wheel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete an alloy wheel
// @route   DELETE /api/alloy-wheels/:id
// @access  Private/Admin
const deleteAlloyWheel = asyncHandler(async (req, res) => {
  try {
    const alloyWheel = await AlloyWheel.findById(req.params.id);

    if (alloyWheel) {
      if (req.user && req.user.role === 'VENDOR' && alloyWheel.created_by?.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this alloy wheel');
      }
      await AlloyWheel.findByIdAndDelete(req.params.id);
      res.json({ message: 'Alloy Wheel removed' });
    } else {
      res.status(404);
      throw new Error('Alloy Wheel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create an alloy wheel
// @route   POST /api/alloy-wheels
// @access  Private/Admin
const createAlloyWheel = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;
    const alloyWheel = new AlloyWheel(data);
    const createdAlloyWheel = await alloyWheel.save();
    res.status(201).json(createdAlloyWheel);
  } catch (error) {
    console.log('Error in createAlloyWheel:', error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update an alloy wheel
// @route   PUT /api/alloy-wheels/:id
// @access  Private
const updateAlloyWheel = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await AlloyWheel.findById(req.params.id);
    if (data) {
      if (req.user && req.user.role === 'VENDOR' && data.created_by?.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this alloy wheel');
      }
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedAlloyWheel = await data.save();
      res.json(updatedAlloyWheel);
    } else {
      res.status(404);
      throw new Error('Alloy Wheel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getAlloyWheels,
  getAlloyWheelById,
  deleteAlloyWheel,
  createAlloyWheel,
  updateAlloyWheel,
  getAllAlloyWheels,
};
