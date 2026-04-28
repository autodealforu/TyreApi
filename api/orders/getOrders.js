import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import mongoose from 'mongoose';

const getOrders = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';

    // Updated vendor filtering for multi-vendor support
    if (req.user && req.user.role === 'VENDOR') {
      // Filter orders where user is one of the vendors in the products array
      searchParams['products.vendor'] = mongoose.Types.ObjectId(req.user._id);
    }

    if (req.user && req.user.role === 'CUSTOMER') {
      searchParams['customer.customer'] = req.user._id;
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

    // Filter by status if provided
    if (req.query.status) {
      searchParams['status'] = req.query.status;
    }

    // Filter by payment status if provided
    if (req.query.payment_status) {
      searchParams['payment_details.payment_status'] = req.query.payment_status;
    }

    // Filter by installation option if provided
    if (req.query.installation_option) {
      searchParams['installation_details.option'] =
        req.query.installation_option;
    }

    console.log('Search Params', searchParams);

    const count = await Order.countDocuments({ ...searchParams });
    const orders = await Order.find({ ...searchParams })
      .limit(pageSize)
      .populate(
        'products.product',
        'name slug brand size regular_price sale_price'
      )
      .populate('products.vendor', 'name email phone store_name location')
      .populate('vendor_commissions.vendor', 'name email phone store_name')
      .populate('customer.customer', 'name email phone')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email')
      .populate('parent_order_id', 'order_id status')
      .populate('child_order_ids', 'order_id status')
      .populate('order_notes.added_by', 'name email')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
      message: 'Orders retrieved successfully',
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while fetching orders.',
    });
  }
});

export { getOrders };
