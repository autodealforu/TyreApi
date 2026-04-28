import asyncHandler from 'express-async-handler';
import Technician from './TechniciansModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all technicians
// @route   GET /api/technicians
// @access  Public
const getTechnicians = asyncHandler(async (req, res) => {
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
    const count = await Technician.countDocuments({ ...searchParams });
    const technicians = await Technician.find({ ...searchParams })
      .limit(pageSize)
      .populate('vendor', '_id, name, vendor')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      technicians,
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
// @desc    Fetch all technicians
// @route   GET /api/technicians/all
// @access  Public
const getAllTechnicians = asyncHandler(async (req, res) => {
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
    const technicians = await Technician.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(technicians);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single technician
// @route   GET /api/technicians/:id
// @access  Public
const getTechnicianById = asyncHandler(async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id).populate(
      'vendor',
      '_id, name, vendor'
    );

    if (technician) {
      res.json(technician);
    } else {
      res.status(404);
      throw new Error('Technician not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a technician
// @route   DELETE /api/technicians/:id
// @access  Private/Admin
const deleteTechnician = asyncHandler(async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);

    if (technician) {
      await technician.remove();
      res.json({ message: 'Technician removed' });
    } else {
      res.status(404);
      throw new Error('Technician not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a technician
// @route   POST /api/technicians
// @access  Private/Admin
const createTechnician = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.vendor = req.user._id;
    const technician = new Technician(data);
    const createdTechnician = await technician.save();
    res.status(201).json(createdTechnician);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a technician
// @route   PUT /api/technicians/:id
// @access  Private
const updateTechnician = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);

    const data = await Technician.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedTechnician = await data.save();
      res.json(updatedTechnician);
    } else {
      res.status(404);
      throw new Error('Technician not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getTechnicians,
  getTechnicianById,
  deleteTechnician,
  createTechnician,
  updateTechnician,
  getAllTechnicians,
};
