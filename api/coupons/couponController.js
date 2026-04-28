import asyncHandler from 'express-async-handler';
import Coupon from './CouponModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
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
    const count = await Coupon.countDocuments({ ...searchParams });
    const coupons = await Coupon.find({ ...searchParams })
      .limit(pageSize)
      .populate('product_collection')
      .populate('product_category')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      coupons,
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
// @desc    Fetch all coupons
// @route   GET /api/coupons/all
// @access  Public
const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const coupons = await Coupon.find({ ...searchParams })
      .populate('product_collection')
      .populate('product_category')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single coupon
// @route   GET /api/coupons/:id
// @access  Public
const getCouponById = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('product_collection')
      .populate('product_category')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (coupon && coupon.published_status === 'PUBLISHED') {
      res.json(coupon);
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.remove();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const coupon = new Coupon(data);
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private
const updateCoupon = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Coupon.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedCoupon = await data.save();
      res.json(updatedCoupon);
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      res.status(400);
      throw new Error('Coupon code and order amount are required');
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({
      code: code,
      published_status: 'PUBLISHED',
    });

    if (!coupon) {
      return res.json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Check minimum order amount
    const minCartValue = Number(coupon.min_cart_value) || 0;
    if (minCartValue && orderAmount < minCartValue) {
      return res.json({
        success: false,
        message: `Minimum order amount of ₹${minCartValue} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    const discountVal = Number(coupon.discount) || 0;
    const maxDiscountVal = Number(coupon.max_discount) || 0;

    if (coupon.discount_type === 'PERCENTAGE') {
      discount = (orderAmount * discountVal) / 100;
      if (maxDiscountVal && discount > maxDiscountVal) {
        discount = maxDiscountVal;
      }
    } else if (coupon.discount_type === 'FIXED') {
      discount = discountVal;
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      discount: discount,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: discountVal,
        minimum_amount: minCartValue,
        maximum_discount: maxDiscountVal,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Error validating coupon');
  }
});

export {
  getCoupons,
  getCouponById,
  deleteCoupon,
  createCoupon,
  updateCoupon,
  getAllCoupons,
  validateCoupon,
};
