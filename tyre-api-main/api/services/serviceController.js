import asyncHandler from 'express-async-handler';
import Service from './ServiceModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  try {
    const pageService = Number(process.env.LIMIT) || 10;
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

    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }

    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }

    // Filter by service category if provided
    if (req.query.category) {
      searchParams.serviceCategory = req.query.category;
    }

    const count = await Service.countDocuments({ ...searchParams });
    const services = await Service.find({ ...searchParams })
      .limit(pageService)
      .populate('productType', '_id name')
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name')
      .skip(pageService * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      services,
      page,
      pages: Math.ceil(count / pageService),
      count: count,
    });
  } catch (error) {
    console.log('Error in getServices:', error);
    res.status(502);
    throw new Error('Something went wrong while fetching services');
  }
});

// @desc    Fetch all services (for dropdown/selection)
// @route   GET /api/services/all
// @access  Public
const getAllServices = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    if (req.query.term && req.query.value) {
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }

    if (req.query.category) {
      searchParams.serviceCategory = req.query.category;
    }

    const services = await Service.find({ ...searchParams })
      .populate('productType', '_id name')
      .populate('created_by', '_id name')
      .populate('updated_by', '_id name')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ serviceName: 1 });

    res.json(services);
  } catch (error) {
    console.log('Error in getAllServices:', error);
    res.status(502);
    throw new Error('Something went wrong while fetching all services');
  }
});

// @desc    Fetch single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('productType', '_id name')
      .populate('created_by', '_id name email')
      .populate('updated_by', '_id name email');

    if (service && service.published_status === 'PUBLISHED') {
      res.json(service);
    } else {
      res.status(404);
      throw new Error('Service not found');
    }
  } catch (error) {
    console.log('Error in getServiceById:', error);
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      await service.remove();
      res.json({ message: 'Service removed successfully' });
    } else {
      res.status(404);
      throw new Error('Service not found');
    }
  } catch (error) {
    console.log('Error in deleteService:', error);
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private
const createService = asyncHandler(async (req, res) => {
  try {
    // Add creator information
    const data = { ...req.body, created_by: req.user._id };

    // Validate required fields
    const requiredFields = [
      'serviceName',
      'serviceDescription',
      'serviceShortName',
      'productType',
      'gstTaxRate',
      'gstType',
      'unit',
      'hsnCode',
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      res.status(400);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const service = new Service(data);
    const createdService = await service.save();

    // Populate the response
    const populatedService = await Service.findById(createdService._id)
      .populate('productType', '_id name')
      .populate('created_by', '_id name');

    res.status(201).json(populatedService);
  } catch (error) {
    console.log('Error in createService:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to create service');
  }
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      // Update fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          service[key] = req.body[key];
        }
      });

      // Update modifier information
      service.updated_by = req.user._id;

      const updatedService = await service.save();

      // Populate the response
      const populatedService = await Service.findById(updatedService._id)
        .populate('productType', '_id name')
        .populate('created_by', '_id name')
        .populate('updated_by', '_id name');

      res.json(populatedService);
    } else {
      res.status(404);
      throw new Error('Service not found');
    }
  } catch (error) {
    console.log('Error in updateService:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to update service');
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const services = await Service.findByCategory(category.toUpperCase())
      .populate('productType', '_id name')
      .populate('created_by', '_id name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ serviceName: 1 });

    const count = await Service.countDocuments({
      serviceCategory: category.toUpperCase(),
      published_status: 'PUBLISHED',
      isActive: true,
    });

    res.json({
      services,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log('Error in getServicesByCategory:', error);
    res.status(502);
    throw new Error('Something went wrong while fetching services by category');
  }
});

export {
  getServices,
  getServiceById,
  deleteService,
  createService,
  updateService,
  getAllServices,
  getServicesByCategory,
};
