import asyncHandler from 'express-async-handler';
import Vehicle from './VehicleModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = asyncHandler(async (req, res) => {
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
    const count = await Vehicle.countDocuments({ ...searchParams });
    const vehicles = await Vehicle.find({ ...searchParams })
      .limit(pageSize)
      .populate('owner', '_id name phone email')
      .populate('makeModel', '_id name makemodel_id')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      vehicles,
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
// @desc    Fetch all vehicles
// @route   GET /api/vehicles/all
// @access  Public
const getAllVehicles = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    // Filter by owner if user role requires it
    if (req?.user?.role === 'CUSTOMER') {
      searchParams['owner'] = req.user._id;
    }

    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const vehicles = await Vehicle.find({ ...searchParams })
      .limit(100)
      .populate('owner', '_id name phone email')
      .populate('makeModel', '_id name makemodel_id')
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', '_id name phone email')
      .populate('makeModel', '_id name makemodel_id');

    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      await vehicle.remove();
      res.json({ message: 'Vehicle removed' });
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const createVehicle = asyncHandler(async (req, res) => {
  try {
    console.log('req.body', req.body);

    var data = checkRequired(req.body);
    // Set owner to current user if not provided in request
    if (!data.owner) {
      data.owner = req.user._id;
    }
    const vehicle = new Vehicle(data);
    const createdVehicle = await vehicle.save();

    // Populate the response to include makeModel details
    const populatedVehicle = await Vehicle.findById(createdVehicle._id)
      .populate('owner', '_id name phone email')
      .populate('makeModel', '_id name makemodel_id');

    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.log('Error', error);

    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);

    const data = await Vehicle.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedVehicle = await data.save();

      // Populate the response to include makeModel details
      const populatedVehicle = await Vehicle.findById(updatedVehicle._id)
        .populate('owner', '_id name phone email')
        .populate('makeModel', '_id name makemodel_id');

      res.json(populatedVehicle);
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getVehicles,
  getVehicleById,
  deleteVehicle,
  createVehicle,
  updateVehicle,
  getAllVehicles,
};
