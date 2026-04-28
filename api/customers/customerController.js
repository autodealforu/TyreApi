import asyncHandler from 'express-async-handler';
import User from '../users/UserModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all customers
// @route   GET /api/customers
// @access  Public
const getCustomers = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['role'] = 'CUSTOMER';

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
    const count = await User.countDocuments({ ...searchParams });
    const customers = await User.find({ ...searchParams })
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      customers,
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
// @desc    Fetch all customers
// @route   GET /api/customers/all
// @access  Public
const getAllCustomers = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    // searchParams["published_status"] = "PUBLISHED";
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const customers = await User.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single customer
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = asyncHandler(async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (customer && customer.published_status === 'PUBLISHED') {
      res.json(customer);
    } else {
      res.status(404);
      throw new Error('Customer not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (customer) {
      await customer.remove();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404);
      throw new Error('Customer not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private/Admin
const createCustomer = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.role = 'CUSTOMER';
    data.username = data.email;
    data.address = [data.address_data];
    if (req.user) {
      data.created_by = req.user._id;
    }
    const customer = new User(data);
    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await User.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedCustomer = await data.save();
      res.json(updatedCustomer);
    } else {
      res.status(404);
      throw new Error('Customer not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getCustomers,
  getCustomerById,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getAllCustomers,
};
