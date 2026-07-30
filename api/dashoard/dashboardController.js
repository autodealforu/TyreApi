import asyncHandler from 'express-async-handler';
import moment from 'moment';
import Order from '../orders/OrderModel.js';
import Product from '../products/ProductModel.js';
import User from '../users/UserModel.js';
import mongoose from 'mongoose';

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

      let orderSearchParams = { ...newSearchParams };
      let productSearchParams = { ...searchParams };

      if (req.user && req.user.role === 'VENDOR') {
        const vendorObjectId = mongoose.Types.ObjectId(req.user._id);
        orderSearchParams['products.vendor'] = vendorObjectId;
        productSearchParams['vendor'] = vendorObjectId;
      }

      const total_products = await Product.countDocuments({
        ...productSearchParams,
      });
      const total_orders = await Order.countDocuments({ ...orderSearchParams });
      const order_status_array = await Order.aggregate([
        { $match: { ...orderSearchParams } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const order_total = await Order.aggregate([
        { $match: { ...orderSearchParams } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]);
      const order_total_stats = await Order.aggregate([
        { $match: { ...orderSearchParams } },
        { $group: { _id: '$status', total: { $sum: '$total_amount' } } },
      ]);

      const order_total_states = await Order.aggregate([
        { $match: { ...orderSearchParams } },
        { $group: { _id: '$address.state', total: { $sum: '$total_amount' } } },
      ]);

      const order_total_states_count = await Order.aggregate([
        { $match: { ...orderSearchParams } },
        { $group: { _id: '$address.state', count: { $sum: 1 } } },
      ]);

      const orders = await Order.find({ ...orderSearchParams })
        .limit(10)
        .sort({
          createdAt: -1,
        });

      let vendor_sales = 0;
      let vendor_commission = 0;
      let vendor_net_earnings = 0;
      let vendor_payout_pending = 0;
      let vendor_payout_completed = 0;

      if (req.user && req.user.role === 'VENDOR') {
        const allVendorOrders = await Order.find(
          { ...orderSearchParams, status: { $nin: ['FAILED', 'CANCELLED'] } },
          { vendor_commissions: 1, commission: 1, total_amount: 1, sub_total: 1, vendor: 1 }
        );

        allVendorOrders.forEach((order) => {
          if (order.vendor_commissions && order.vendor_commissions.length > 0) {
            const vc = order.vendor_commissions.find(
              (v) => v.vendor && v.vendor.toString() === req.user._id.toString()
            );
            if (vc) {
              const sales = vc.total_amount || 0;
              const comm = vc.commission_amount || 0;
              const tax = comm * 0.18;
              const net = sales - comm - tax;

              vendor_sales += sales;
              vendor_commission += comm;
              vendor_net_earnings += net;

              if (vc.payment_status === 'PAID') {
                vendor_payout_completed += net;
              } else {
                vendor_payout_pending += net;
              }
            }
          } else if (order.vendor && order.vendor.toString() === req.user._id.toString()) {
            const sales = order.sub_total || order.total_amount || 0;
            const comm = order.commission?.commission_amount || 0;
            const tax = order.commission?.tax || (comm * 0.18);
            const net = sales - comm - tax;

            vendor_sales += sales;
            vendor_commission += comm;
            vendor_net_earnings += net;

            if (order.commission?.is_paid) {
              vendor_payout_completed += net;
            } else {
              vendor_payout_pending += net;
            }
          }
        });
      }

      let total_commissions = 0;
      let total_payout_pending = 0;
      let total_payout_completed = 0;
      let vendor_payouts_list = [];

      if (req.user && req.user.role === 'SUPER ADMIN') {
        const allOrders = await Order.find(
          { ...orderSearchParams, status: { $nin: ['FAILED', 'CANCELLED'] } },
          { vendor_commissions: 1, commission: 1, total_amount: 1, sub_total: 1, vendor: 1 }
        );

        const vendorMap = {};

        allOrders.forEach((order) => {
          if (order.vendor_commissions && order.vendor_commissions.length > 0) {
            order.vendor_commissions.forEach((vc) => {
              const vId = vc.vendor ? vc.vendor.toString() : 'general';
              const storeName = vc.store_name || vc.vendor_name || 'Vendor';

              if (!vendorMap[vId]) {
                vendorMap[vId] = {
                  vendor_id: vId,
                  store_name: storeName,
                  total_sales: 0,
                  total_commission: 0,
                  pending_payout: 0,
                  completed_payout: 0,
                  orders_count: 0,
                };
              }

              const sales = vc.total_amount || 0;
              const commRate = vc.commission_rate || 10;
              const comm = vc.commission_amount || (sales * (commRate / 100));
              const tax = comm * 0.18;
              const net = Math.max(0, sales - comm - tax);

              total_commissions += comm;
              vendorMap[vId].total_sales += sales;
              vendorMap[vId].total_commission += comm;
              vendorMap[vId].orders_count += 1;

              if (vc.payment_status === 'PAID') {
                total_payout_completed += net;
                vendorMap[vId].completed_payout += net;
              } else {
                total_payout_pending += net;
                vendorMap[vId].pending_payout += net;
              }
            });
          } else {
            const sales = order.sub_total || order.total_amount || 0;
            const commRate = order.commission?.commission_percentage || 10;
            const comm = order.commission?.commission_amount || (sales * (commRate / 100));
            const tax = order.commission?.tax || (comm * 0.18);
            const net = Math.max(0, sales - comm - tax);

            total_commissions += comm;

            if (order.commission?.is_paid) {
              total_payout_completed += net;
            } else {
              total_payout_pending += net;
            }
          }
        });

        vendor_payouts_list = Object.values(vendorMap);
      }

      res.json({
        total_products: total_products,
        total_orders,
        order_status_array,
        order_total,
        order_total_stats,
        orders,
        order_total_states,
        order_total_states_count,
        commission_stats: {
          vendor_sales,
          vendor_commission,
          vendor_net_earnings,
          vendor_payout_pending,
          vendor_payout_completed,
          total_commissions,
          total_payout_pending,
          total_payout_completed,
          vendor_payouts_list,
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

export { getDashboards };
