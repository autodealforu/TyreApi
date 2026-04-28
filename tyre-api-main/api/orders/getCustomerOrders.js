import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';

// @desc    Get orders for a specific customer
// @route   GET /api/orders/customer/:customerId
// @access  Private (Customer/Admin)
const getCustomerOrders = asyncHandler(async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }

    // Only allow customer to fetch their own orders, or admin
    if (req.user.role === 'CUSTOMER' && req.user._id.toString() !== customerId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const orders = await Order.find({ 'customer.customer': customerId })
      .sort({ order_date: -1 })
      .limit(50);

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch customer orders.' });
  }
});

export { getCustomerOrders };
