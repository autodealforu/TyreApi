import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import Product from '../products/ProductModel.js';
import User from '../users/UserModel.js';

// @desc    Get order tracking information
// @route   GET /api/orders/:id/tracking
// @access  Public (with order number verification)
const getOrderTracking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { order_number, email } = req.query;

    let order;

    // If user is authenticated, get order by ID
    if (req.user) {
      order = await Order.findById(id)
        .populate('customer', 'name email phone')
        .populate('products.product', 'name sku images')
        .populate('vendor_commissions.vendor', 'name store_name location');

      // Verify order belongs to user (unless admin)
      if (
        req.user.role !== 'ADMIN' &&
        order?.customer._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      // For public tracking, require order number and email
      if (!order_number || !email) {
        return res.status(400).json({
          success: false,
          message: 'Order number and email are required for tracking',
        });
      }

      order = await Order.findOne({
        order_number: order_number,
        'customer_details.email': email,
      })
        .populate('products.product', 'name sku images')
        .populate('vendor_commissions.vendor', 'name store_name location');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Build tracking timeline
    const trackingTimeline = [
      {
        status: 'PENDING',
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        timestamp: order.order_date,
        completed: true,
        icon: 'order-placed',
      },
      {
        status: 'CONFIRMED',
        title: 'Order Confirmed',
        description: 'Payment received and order confirmed',
        timestamp: order.confirmed_at,
        completed: order.confirmed_at ? true : false,
        icon: 'order-confirmed',
      },
      {
        status: 'PROCESSING',
        title: 'Processing',
        description: 'Your order is being prepared for dispatch',
        timestamp: order.processing_at,
        completed: [
          'PROCESSING',
          'SHIPPED',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
        ].includes(order.status),
        icon: 'processing',
      },
      {
        status: 'SHIPPED',
        title: 'Shipped',
        description: 'Your order has been shipped',
        timestamp: order.shipped_at,
        completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
          order.status
        ),
        icon: 'shipped',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        timestamp: order.out_for_delivery_at,
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        icon: 'out-for-delivery',
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Your order has been delivered successfully',
        timestamp: order.delivered_at,
        completed: order.status === 'DELIVERED',
        icon: 'delivered',
      },
    ];

    // Add installation tracking if applicable
    let installationTracking = null;
    if (order.installation_option !== 'NONE' && order.installation_details) {
      installationTracking = {
        option: order.installation_option,
        status: order.installation_details.status,
        scheduled_date: order.installation_details.scheduled_date,
        completed_at: order.installation_details.completed_at,
        technician: order.installation_details.technician_details,
        notes: order.installation_details.notes,
      };
    }

    const trackingInfo = {
      order_id: order._id,
      order_number: order.order_number,
      current_status: order.status,
      payment_status: order.payment_status,

      // Customer info (limited for public tracking)
      customer: req.user
        ? order.customer
        : {
            name: order.customer_details.name,
            email: order.customer_details.email,
          },

      // Products summary
      products: order.products.map((product) => ({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        image: product.product.images?.[0] || null,
      })),

      // Delivery information
      delivery_option: order.delivery_option,
      estimated_delivery: order.estimated_delivery,
      shipping_address: order.shipping_address,

      // Tracking timeline
      tracking_timeline: trackingTimeline,

      // Installation tracking
      installation_tracking: installationTracking,

      // Additional details
      total_amount: order.total_amount,
      order_date: order.order_date,
    };

    res.json({
      success: true,
      tracking: trackingInfo,
      message: 'Order tracking information retrieved successfully',
    });
  } catch (error) {
    console.error('Get Order Tracking Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Something went wrong while fetching tracking information.',
    });
  }
});

// @desc    Update order status (Admin/Vendor)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Vendor)
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status, notes, tracking_details } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify user has permission to update this order
    if (req.user.role === 'VENDOR') {
      const hasProducts = order.vendor_commissions.some(
        (vc) => vc.vendor.toString() === req.user._id.toString()
      );

      if (!hasProducts) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - no products from your store in this order',
        });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const previousStatus = order.status;
    order.status = status;

    // Update timestamps based on status
    const currentTime = new Date();
    switch (status) {
      case 'CONFIRMED':
        order.confirmed_at = currentTime;
        break;
      case 'PROCESSING':
        order.processing_at = currentTime;
        break;
      case 'SHIPPED':
        order.shipped_at = currentTime;
        if (tracking_details) {
          order.tracking_details = {
            ...order.tracking_details,
            ...tracking_details,
          };
        }
        break;
      case 'OUT_FOR_DELIVERY':
        order.out_for_delivery_at = currentTime;
        break;
      case 'DELIVERED':
        order.delivered_at = currentTime;
        break;
      case 'CANCELLED':
        order.cancelled_at = currentTime;
        break;
      case 'RETURNED':
        order.returned_at = currentTime;
        break;
    }

    // Add status change note
    if (notes) {
      const statusNote = {
        type: 'STATUS_UPDATE',
        content: notes,
        previous_status: previousStatus,
        new_status: status,
        created_by: req.user._id,
        created_by_name: req.user.name,
        created_by_role: req.user.role,
        created_at: currentTime,
      };

      order.order_notes = order.order_notes || [];
      order.order_notes.push(statusNote);
    }

    await order.save();

    // TODO: Send notification to customer about status change
    // TODO: Update inventory if order is cancelled/returned

    res.json({
      success: true,
      order: {
        _id: order._id,
        order_number: order.order_number,
        status: order.status,
        previous_status: previousStatus,
        updated_at: currentTime,
      },
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while updating order status.',
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { reason, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to user (unless admin)
    if (
      req.user.role !== 'ADMIN' &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
      });
    }

    const previousStatus = order.status;
    order.status = 'CANCELLED';
    order.cancelled_at = new Date();

    // Add cancellation note
    const cancellationNote = {
      type: 'CANCELLATION',
      content: notes || `Order cancelled. Reason: ${reason}`,
      cancellation_reason: reason,
      previous_status: previousStatus,
      created_by: req.user._id,
      created_by_name: req.user.name,
      created_by_role: req.user.role,
      created_at: new Date(),
    };

    order.order_notes = order.order_notes || [];
    order.order_notes.push(cancellationNote);

    // Update payment status if payment was completed
    if (order.payment_status === 'COMPLETED') {
      order.payment_status = 'REFUND_INITIATED';
      // TODO: Initiate refund process
    }

    await order.save();

    // TODO: Send cancellation notification to customer and vendors
    // TODO: Update inventory availability

    res.json({
      success: true,
      order: {
        _id: order._id,
        order_number: order.order_number,
        status: order.status,
        cancelled_at: order.cancelled_at,
        cancellation_reason: reason,
      },
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while cancelling order.',
    });
  }
});

// @desc    Get customer order history
// @route   GET /api/orders/my-orders
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { customer: req.user._id };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('products.product', 'name sku images')
      .sort({ order_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    const orderSummary = orders.map((order) => ({
      _id: order._id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      product_count: order.products.length,
      order_date: order.order_date,
      estimated_delivery: order.estimated_delivery,
      first_product: {
        name: order.products[0]?.name,
        image: order.products[0]?.product?.images?.[0] || null,
      },
    }));

    res.json({
      success: true,
      orders: orderSummary,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalOrders / limit),
        total_orders: totalOrders,
        has_next: page < Math.ceil(totalOrders / limit),
        has_prev: page > 1,
      },
      message: 'Customer orders retrieved successfully',
    });
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while fetching orders.',
    });
  }
});

export { getOrderTracking, updateOrderStatus, cancelOrder, getCustomerOrders };
