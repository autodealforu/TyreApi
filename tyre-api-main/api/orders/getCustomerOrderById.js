import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';

// @desc    Get a single order for a specific customer
// @route   GET /api/orders/customer/:customerId/:orderId
// @access  Private (Customer/Admin)
const getCustomerOrderById = asyncHandler(async (req, res) => {
  try {
    const { customerId, orderId } = req.params;
    if (!customerId || !orderId) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Customer ID and Order ID are required.',
        });
    }

    // Only allow customer to fetch their own order, or admin
    if (
      req.user.role === 'CUSTOMER' &&
      req.user._id.toString() !== customerId.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied.' });
    }

    const order = await Order.findOne({
      _id: orderId,
      'customer.customer': customerId,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || 'Failed to fetch order.',
      });
  }
});

export { getCustomerOrderById };
