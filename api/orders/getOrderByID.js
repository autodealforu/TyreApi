import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';

const getOrderById = asyncHandler(async (req, res) => {
  try {
    let order;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);

    if (isObjectId) {
      order = await Order.findById(req.params.id);
    } else {
      const numericId = Number(req.params.id);
      if (!isNaN(numericId)) {
        order = await Order.findOne({ order_id: numericId });
      }
    }

    if (order) {
      // Re-fetch with populations
      order = await Order.findById(order._id)
        .populate(
          'products.product',
          'name slug brand size regular_price sale_price tyre'
        )
        .populate(
          'products.vendor',
          'name email phone store_name location address'
        )
        .populate(
          'vendor_commissions.vendor',
          'name email phone store_name location'
        )
        .populate('customer.customer', 'name email phone address')
        .populate('created_by', 'name email')
        .populate('updated_by', 'name email')
        .populate('parent_order_id', 'order_id status total_amount')
        .populate('child_order_ids', 'order_id status total_amount')
        .populate('order_notes.added_by', 'name email role')
        .populate('inventory_details.product', 'name slug')
        .populate('inventory_details.vendor', 'name store_name')
        .populate({
          path: 'products.product',
          populate: {
            path: 'tyre',
            select: 'name brand size specifications',
          },
        });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.published_status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check user permissions
    // if (req.user) {
    //   const canView =
    //     req.user.role === 'ADMIN' ||
    //     req.user.role === 'SUPER_ADMIN' ||
    //     (req.user.role === 'CUSTOMER' &&
    //       order.customer.customer &&
    //       order.customer.customer.toString() === req.user._id.toString()) ||
    //     (req.user.role === 'VENDOR' &&
    //       order.vendor_commissions.some(
    //         (vc) => vc.vendor.toString() === req.user._id.toString()
    //       ));

    //   if (!canView) {
    //     return res.status(403).json({
    //       success: false,
    //       message:
    //         'Access denied. You do not have permission to view this order.',
    //     });
    //   }
    // }

    res.json({
      success: true,
      order,
      message: 'Order retrieved successfully',
    });
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while fetching the order.',
    });
  }
});

export { getOrderById };
