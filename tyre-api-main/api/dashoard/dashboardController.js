import asyncHandler from 'express-async-handler';
import moment from 'moment';
import Order from '../orders/OrderModel.js';
import Product from '../products/ProductModel.js';
import User from '../users/UserModel.js';

// @desc    Fetch all dashboards
// @route   GET /api/dashboards
// @access  Public
const getDashboards = asyncHandler(async (req, res) => {
  try {
    // console.log('Req User', req.user);
    if (req.user && req.user.role === 'FRANCHISE') {
      // Total Vendors
      let searchParams = {};
      // console.log('Current User', req.user);

      if (req.query.conditional) {
        const conditionalQ = req.query.conditional;

        searchParams = { ...searchParams, ...conditionalQ };
      }

      // Total Orders from State

      // Total Vendors
      const newSearchParams = {
        ...searchParams,
        'vendor.pickup_address.state': { $in: req.user.franchise_state },
      };
      console.log('Vendor Search Params', newSearchParams);
      const total_vendors = await User.countDocuments({ ...newSearchParams });
      console.log('total_vendors', total_vendors);
      // Total Orders
      const newOrderSearchParams = {
        ...searchParams,
        'address.state': { $in: req.user.franchise_state },
      };
      const total_orders = await Order.countDocuments({
        ...newOrderSearchParams,
      });

      console.log('Total Orders', total_orders);

      // Total Orders Status Wise
      const order_status_array = await Order.aggregate([
        { $match: { ...newOrderSearchParams } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
      console.log('Total Orders Status', order_status_array);

      // Order Sum
      const order_total = await Order.aggregate([
        { $match: { ...newOrderSearchParams } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]);
      const order_total_stats = await Order.aggregate([
        { $match: { ...newOrderSearchParams } },
        { $group: { _id: '$status', total: { $sum: '$total_amount' } } },
      ]);
      console.log('order_total', order_total);
      console.log('order_total_stats', order_total_stats);

      res.json({
        total_vendors: total_vendors,
        total_orders,
        order_status_array,
        order_total,
        order_total_stats,
      });
    } else {
      let searchParams = {};

      if (req.query.conditional) {
        const conditionalQ = req.query.conditional;

        searchParams = { ...searchParams, ...conditionalQ };
      }

      let newSearchParams = {};

      if (searchParams.createdAt) {
        newSearchParams.createdAt = {};
        if (searchParams.createdAt['$gte']) {
          newSearchParams.createdAt['$gte'] = new Date(
            searchParams.createdAt['$gte']
          );
        }
        if (searchParams.createdAt['$lte']) {
          newSearchParams.createdAt['$lte'] = new Date(
            searchParams.createdAt['$lte']
          );
        }
      }
      if (req.user && req.user.role === 'VENDOR') {
        newSearchParams['vendor'] = req.user._id;
      }

      if (req.user && req.user.role === 'VENDOR') {
        searchParams['vendor'] = req.user._id;
      }
      const total_products = await Product.countDocuments({ ...searchParams });
      const total_orders = await Order.countDocuments({ ...searchParams });
      const order_status_array = await Order.aggregate([
        { $match: { ...newSearchParams } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const order_total = await Order.aggregate([
        { $match: { ...newSearchParams } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]);
      const order_total_stats = await Order.aggregate([
        { $match: { ...newSearchParams } },
        { $group: { _id: '$status', total: { $sum: '$total_amount' } } },
      ]);

      const order_total_states = await Order.aggregate([
        { $match: { ...newSearchParams } },
        { $group: { _id: '$address.state', total: { $sum: '$total_amount' } } },
      ]);

      const order_total_states_count = await Order.aggregate([
        { $match: { ...newSearchParams } },
        { $group: { _id: '$address.state', count: { $sum: 1 } } },
      ]);

      const orders = await Order.find({ ...searchParams })
        .limit(10)
        .sort({
          createdAt: -1,
        });

      res.json({
        total_products: total_products,
        total_orders,
        order_status_array,
        order_total,
        order_total_stats,
        orders,
        order_total_states,
        order_total_states_count,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

export { getDashboards };
