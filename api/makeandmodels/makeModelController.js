import asyncHandler from 'express-async-handler';
import MakeModel from './MakeAndModelModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all makemodels
// @route   GET /api/makemodels
// @access  Public
const getMakeModels = asyncHandler(async (req, res) => {
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

    const count = await MakeModel.countDocuments({ ...searchParams });
    const makemodels = await MakeModel.find({ ...searchParams })
      .limit(pageSize)
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      makemodels,
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

// @desc    Fetch all makemodels
// @route   GET /api/makemodels/all
// @access  Public
const getAllMakeModels = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    if (req.query.term && req.query.value) {
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }

    if (req.query.published_status) {
      searchParams.published_status = req.query.published_status;
    } else {
      searchParams.published_status = 'PUBLISHED';
    }

    const makemodels = await MakeModel.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(makemodels);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single makemodel
// @route   GET /api/makemodels/:id
// @access  Public
const getMakeModelById = asyncHandler(async (req, res) => {
  try {
    const makemodel = await MakeModel.findById(req.params.id)
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name');

    if (makemodel) {
      res.json(makemodel);
    } else {
      res.status(404);
      throw new Error('MakeModel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a makemodel
// @route   DELETE /api/makemodels/:id
// @access  Private/Admin
const deleteMakeModel = asyncHandler(async (req, res) => {
  try {
    const makemodel = await MakeModel.findById(req.params.id);

    if (makemodel) {
      await makemodel.deleteOne();
      res.json({ message: 'MakeModel removed' });
    } else {
      res.status(404);
      throw new Error('MakeModel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a makemodel
// @route   POST /api/makemodels
// @access  Private/Admin
const createMakeModel = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;
    const makemodel = new MakeModel(data);
    const createdMakeModel = await makemodel.save();

    // Populate the response
    const populatedMakeModel = await MakeModel.findById(createdMakeModel._id)
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name');

    res.status(201).json(populatedMakeModel);
  } catch (error) {
    console.log('Error', error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a makemodel
// @route   PUT /api/makemodels/:id
// @access  Private
const updateMakeModel = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;

    const data = await MakeModel.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedMakeModel = await data.save();

      // Populate the response
      const populatedMakeModel = await MakeModel.findById(updatedMakeModel._id)
        .populate('created_by', '_id name')
        .populate('updated_by', '_id name');

      res.json(populatedMakeModel);
    } else {
      res.status(404);
      throw new Error('MakeModel not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getMakeModels,
  getMakeModelById,
  deleteMakeModel,
  createMakeModel,
  updateMakeModel,
  getAllMakeModels,
};
