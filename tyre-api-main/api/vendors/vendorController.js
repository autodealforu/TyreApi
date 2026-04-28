import asyncHandler from 'express-async-handler';
import User from '../users/UserModel.js';
import checkRequired from '../../utils/checkRequired.js';
import { getTotalProductsByVendor } from './vendorService.js';
import shipRocketAddPickupAddress from '../../utils/shipping/shiprocketPickupAddress.js';

// @desc    Fetch all vendors
// @route   GET /api/vendors
// @access  Public
const getVendors = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['role'] = 'VENDOR';
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
    const count = await User.countDocuments({ ...searchParams });
    const vendors = await User.find({ ...searchParams }, {}, { lean: true })
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    let newVendorToShow = [];
    const getWithPromiseAll = async () => {
      const promises = vendors.map(async (item) => {
        const vendorNew = await getTotalProductsByVendor({
          vendor: item,
        });
        newVendorToShow.push(vendorNew);
      });
      await Promise.all(promises);
    };

    await getWithPromiseAll();

    console.log('Vendor', newVendorToShow);
    res.json({
      vendors: newVendorToShow,
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
// @desc    Fetch all vendors
// @route   GET /api/vendors/all
// @access  Public
const getAllVendors = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['role'] = 'VENDOR';
    searchParams['published_status'] = 'PUBLISHED';
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['_id'] = req.user._id;
    }
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const vendors = await User.find({ ...searchParams }).sort({
      createdAt: -1,
    });
    res.json(vendors);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single vendor
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = asyncHandler(async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (vendor && vendor.published_status === 'PUBLISHED') {
      res.json(vendor);
    } else {
      res.status(404);
      throw new Error('Vendor not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

const addPickupAddress = asyncHandler(async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (
      vendor &&
      vendor.published_status === 'PUBLISHED' &&
      vendor.vendor.pickup_address &&
      vendor.vendor.pickup_address.length > 0
    ) {
      const pickupaddress = await shipRocketAddPickupAddress({
        vendor: vendor.vendor,
        user: vendor,
        vendor_id: vendor.user_id,
      });
      res.json({ vendor, pickupaddress });
    } else {
      res.status(404);
      throw new Error('Pickup Address not defind');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
const deleteVendor = asyncHandler(async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (vendor) {
      await vendor.remove();
      res.json({ message: 'Vendor removed' });
    } else {
      res.status(404);
      throw new Error('Vendor not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a vendor
// @route   POST /api/vendors
// @access  Private/Admin
const createVendor = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    data.role = 'VENDOR';
    data.username = data.email;
    console.log('DATA', data);
    const vendor = new User(data);
    const createdVendor = await vendor.save();
    res.status(201).json(createdVendor);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = asyncHandler(async (req, res) => {
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
      const updatedVendor = await data.save();
      res.json(updatedVendor);
    } else {
      res.status(404);
      throw new Error('Vendor not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getVendors,
  getVendorById,
  deleteVendor,
  createVendor,
  updateVendor,
  getAllVendors,
  addPickupAddress,
};
