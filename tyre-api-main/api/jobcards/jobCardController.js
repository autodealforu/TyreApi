import asyncHandler from 'express-async-handler';
import JobCard from './JobCardModel.js';
import checkRequired from '../../utils/checkRequired.js';
import User from '../users/UserModel.js';
import Vehicle from '../vehicles/VehicleModel.js';
import sendEmail from '../../utils/mail.js'; // Assuming you have a utility for sending emails

// @desc    Fetch all jobCards
// @route   GET /api/jobCards
// @access  Public
const getJobCards = asyncHandler(async (req, res) => {
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
    const count = await JobCard.countDocuments({ ...searchParams });
    const jobCards = await JobCard.find({ ...searchParams })
      .populate('vehicle')
      .populate('customer')
      .populate('vendor')
      .populate({
        path: 'products_used.product_id',
        populate: [
          { path: 'tyre' },
          { path: 'alloy_wheel' },
          { path: 'service' },
        ],
      })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      jobCards,
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
// @desc    Fetch all jobCards
// @route   GET /api/jobCards/all
// @access  Public
const getAllJobCards = asyncHandler(async (req, res) => {
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
    const jobCards = await JobCard.find({ ...searchParams })
      .populate('vehicle')
      .populate('customer')
      .populate('vendor')
      .populate({
        path: 'products_used.product_id',
        populate: [
          { path: 'tyre' },
          { path: 'alloy_wheel' },
          { path: 'service' },
        ],
      })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(jobCards);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single jobCard
// @route   GET /api/jobCards/:id
// @access  Public
const getJobCardById = asyncHandler(async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate('vehicle')
      .populate('customer')
      .populate('vendor')
      .populate('service_technician')
      .populate('services_used.service_id', '_id, name, price')
      .populate({
        path: 'products_used.product_id',
        populate: [
          { path: 'tyre' },
          { path: 'alloy_wheel' },
          { path: 'service' },
        ],
      });

    if (jobCard) {
      res.json(jobCard);
    } else {
      res.status(404);
      throw new Error('JobCard not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a jobCard
// @route   DELETE /api/jobCards/:id
// @access  Private/Admin
const deleteJobCard = asyncHandler(async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id);

    if (jobCard) {
      await jobCard.remove();
      res.json({ message: 'JobCard removed' });
    } else {
      res.status(404);
      throw new Error('JobCard not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a jobCard
// @route   POST /api/jobCards
// @access  Private/Admin
const createJobCard = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
      data.vendor = data.vendor ? data.vendor : req.user._id;
    }

    // Function to convert tax percentage string to number
    const convertTaxToNumber = (tax) => {
      if (typeof tax === 'string' && tax.includes('%')) {
        return parseFloat(tax.replace('%', ''));
      }
      return parseFloat(tax) || 0;
    };

    // Sanitize services_used tax fields
    if (data.services_used && Array.isArray(data.services_used)) {
      data.services_used = data.services_used.map((service) => {
        if (
          !service?.service_id ||
          service.service_id === '' ||
          service.service_id === null ||
          service.service_id === undefined ||
          service.service_id === 'other'
        ) {
          delete service.service_id;
        }
        return {
          ...service,
          service_tax: convertTaxToNumber(service.service_tax),
        };
      });
    }

    // Sanitize products_used tax fields
    if (data.products_used && Array.isArray(data.products_used)) {
      data.products_used = data.products_used.map((product) => ({
        ...product,
        product_tax: convertTaxToNumber(product.product_tax),
      }));
    }

    // Sanitize service_parts_used tax fields
    if (data.service_parts_used && Array.isArray(data.service_parts_used)) {
      data.service_parts_used = data.service_parts_used.map((part) => ({
        ...part,
        part_tax: convertTaxToNumber(part.part_tax),
      }));
    }

    // Ensure service_total_cost is provided and is a number
    if (!data.service_total_cost) {
      data.service_total_cost = 0;
    }
    data.service_total_cost = parseFloat(data.service_total_cost) || 0;

    // Ensure service_labor_cost is provided and is a number
    if (!data.service_labor_cost) {
      data.service_labor_cost = 0;
    }
    data.service_labor_cost = parseFloat(data.service_labor_cost) || 0;

    // Handle new Zoho form fields
    const {
      form_type,
      odometer_reading,
      next_service_due_odometer_reading = 5000,

      brake_pad_status,
      other_services,
      check_list,
      terms_and_conditions_accepted,
    } = req.body;

    console.log(req.body);

    // Validate required fields for Zoho form
    if (
      data.status === 'active' &&
      (!form_type ||
        odometer_reading === undefined ||
        !brake_pad_status ||
        !check_list ||
        terms_and_conditions_accepted === undefined)
    ) {
      res.status(400);
      throw new Error('Missing required Zoho form fields');
    }

    // Add Zoho form fields to data

    data.form_type = form_type;
    data.odometer_reading = parseFloat(odometer_reading) || 0;
    data.next_service_due_odometer_reading =
      parseFloat(next_service_due_odometer_reading) || 5000;
    data.brake_pad_status = parseInt(brake_pad_status);
    data.other_services = other_services;
    data.check_list = check_list;
    data.terms_and_conditions_accepted = Boolean(terms_and_conditions_accepted);

    const jobCard = new JobCard(data);
    const createdJobCard = await jobCard.save();
    res.status(201).json(createdJobCard);
  } catch (error) {
    console.log('Error', error);

    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a jobCard
// @route   PUT /api/jobCards/:id
// @access  Private
const updateJobCard = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);

    const data = await JobCard.findById(req.params.id);
    if (data) {
      // Handle new Zoho form fields if provided
      const allowedFields = [
        'month_year',
        'form_type',
        'odometer_reading',
        'next_service_due_odometer_reading',
        'wheel_alignment_service',
        'brake_pad_status',
        'tyres_changed_or_purchased',
        'wheel_balancing_done',
        'nalki_used',
        'other_services',
        'check_list',
        'terms_and_conditions_accepted',
      ];

      // Update all fields including new Zoho form fields
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });

      // Update timestamp
      data.updated_at = new Date();

      const updatedJobCard = await data.save();
      res.json(updatedJobCard);
    } else {
      res.status(404);
      throw new Error('JobCard not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

// @desc    Get user and vehicles based on phone or vehicle_number
// @route   POST /api/jobCards/getUserAndVehicle
// @access  Private
const getUserAndVehicle = asyncHandler(async (req, res) => {
  try {
    const { phone, vehicle_number } = req.body;

    if (phone) {
      // Find user by phone
      const user = await User.findOne({ phone });
      if (user) {
        // Find vehicles associated with the user
        const vehicles = await Vehicle.find({ owner: user._id });
        return res.json({ customer: user, vehicles });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    if (vehicle_number) {
      // Find vehicle by vehicle_number
      const vehicle = await Vehicle.findOne({ vehicle_number }).populate(
        'owner'
      );
      if (vehicle) {
        return res.json({ customer: vehicle.owner, vehicles: [vehicle] });
      } else {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
    }

    res
      .status(400)
      .json({ message: 'Please provide either phone or vehicle_number' });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a customer and vehicle
// @route   POST /api/jobCards/createCustomerAndVehicle
// @access  Private
const createCustomerAndVehicle = asyncHandler(async (req, res) => {
  try {
    console.log('Req Body', req.body);

    const {
      name,
      email,
      phone,
      make,
      model,
      year,
      vin,
      vehicle_number,
      makeModel,
    } = req.body;

    // Check if user exists by email or phone
    let user = await User.findOne({ $or: [{ email }, { phone }] });

    if (!user) {
      // Generate a 6-digit random password
      const password = Math.floor(100000 + Math.random() * 900000).toString();

      // Create a new user if not found
      user = new User({
        name,
        email,
        phone,
        password,
        username: email,
        role: 'CUSTOMER',
      });
      user = await user.save();

      // Send email to the user with the autogenerated password
      const emailSubject = 'Welcome to Our Service';
      const emailBody = `
        Hi ${name},
        
        Your account has been created successfully. Here are your login details:
        Email: ${email}
        Password: ${password}
        
        Please log in and change your password for security reasons.
        
        
      `;
      await sendEmail(email, emailSubject, emailBody);
    }

    // Create a new vehicle with the user as the owner
    const vehicle = new Vehicle({
      makeModel,
      year,
      vin,
      vehicle_number,
      owner: user._id,
    });

    const createdVehicle = await vehicle.save();
    console.log('createdVehicle', createdVehicle);

    res.status(201).json({ customer: user, vehicle: createdVehicle });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

export {
  getJobCards,
  getJobCardById,
  deleteJobCard,
  createJobCard,
  updateJobCard,
  getAllJobCards,
  getUserAndVehicle,
  createCustomerAndVehicle,
};
