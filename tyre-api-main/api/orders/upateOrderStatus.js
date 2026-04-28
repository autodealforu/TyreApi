import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import sendEmail from '../../utils/mail.js';
import { ORDER_UPDATE_TEMPLATE } from '../../utils/template/OrderStatusTemplate.js';

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check user permissions
    if (req.user) {
      const canUpdate =
        req.user.role === 'ADMIN' ||
        req.user.role === 'SUPER_ADMIN' ||
        (req.user.role === 'VENDOR' &&
          order.vendor_commissions.some(
            (vc) => vc.vendor.toString() === req.user._id.toString()
          ));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message:
            'Access denied. You do not have permission to update this order status.',
        });
      }
    }

    const oldStatus = order.status;
    order.status = status;
    order.updated_by = req.user._id;

    // Add order note for status change
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note: note || `Order status changed from ${oldStatus} to ${status}`,
      added_by: req.user._id,
      note_type: 'INTERNAL',
      created_at: new Date(),
    });

    const updatedOrder = await order.save();

    // Populate the updated order for response
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('products.vendor', 'name email phone store_name')
      .populate('customer.customer', 'name email phone');

    // Send email notification
    if (populatedOrder.customer && populatedOrder.customer.email) {
      sendEmail({
        to: populatedOrder.customer.email,
        subject: `Your order #${populatedOrder.order_id} status has been updated to ${status}`,
        html: ORDER_UPDATE_TEMPLATE({ order: populatedOrder }),
      });
    }

    res.json({
      success: true,
      order: populatedOrder,
      message: 'Order status updated successfully',
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

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { payment_status, transaction_id, gateway, payment_amount } =
      req.body;

    if (!payment_status) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update payment details
    if (!order.payment_details) {
      order.payment_details = {};
    }

    order.payment_details.payment_status = payment_status;
    order.payment_details.payment_amount = payment_amount || order.total_amount;

    if (transaction_id) {
      order.payment_details.transaction_id = transaction_id;
    }

    if (gateway) {
      order.payment_details.gateway = gateway;
    }

    if (payment_status === 'SUCCESS') {
      order.is_paid = true;
      order.payment_details.payment_date = new Date();
    } else if (payment_status === 'FAILED' || payment_status === 'REFUNDED') {
      order.is_paid = false;
      if (payment_status === 'REFUNDED') {
        order.payment_details.refund_date = new Date();
        order.payment_details.refund_amount =
          payment_amount || order.total_amount;
      }
    }

    order.updated_by = req.user._id;

    // Add order note
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note: `Payment status updated to ${payment_status}${
        transaction_id ? ` (Transaction ID: ${transaction_id})` : ''
      }`,
      added_by: req.user._id,
      note_type: 'INTERNAL',
      created_at: new Date(),
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while updating payment status.',
    });
  }
});

// @desc    Update delivery charges
// @route   PUT /api/orders/:id/delivery-charges
// @access  Private
const updateDeliveryCharges = asyncHandler(async (req, res) => {
  try {
    const { delivery_charges, delivery_option, estimated_delivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update delivery details
    if (delivery_charges !== undefined) {
      order.delivery_charges = delivery_charges;

      if (!order.delivery_details) {
        order.delivery_details = {};
      }
      order.delivery_details.delivery_charges = delivery_charges;
    }

    if (delivery_option) {
      if (!order.delivery_details) {
        order.delivery_details = {};
      }
      order.delivery_details.option = delivery_option;
    }

    if (estimated_delivery) {
      if (!order.delivery_details) {
        order.delivery_details = {};
      }
      order.delivery_details.estimated_delivery = new Date(estimated_delivery);
    }

    // Recalculate total amount
    order.total_amount =
      order.sub_total +
      (order.delivery_charges || 0) +
      (order.tax || 0) +
      (order.installation_details?.total_installation_fee || 0) -
      (order.discount || 0);

    order.updated_by = req.user._id;

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Delivery charges updated successfully',
    });
  } catch (error) {
    console.error('Update Delivery Charges Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Something went wrong while updating delivery charges.',
    });
  }
});

// @desc    Update vendor payout status
// @route   PUT /api/orders/:id/payout-status
// @access  Private/Admin
const updatePayoutStatus = asyncHandler(async (req, res) => {
  try {
    const { vendor_id, is_paid } = req.body;

    if (!vendor_id || is_paid === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID and payout status are required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Find and update vendor commission
    const vendorCommission = order.vendor_commissions.find(
      (vc) => vc.vendor.toString() === vendor_id
    );

    if (!vendorCommission) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found in this order',
      });
    }

    vendorCommission.is_paid = is_paid;
    order.updated_by = req.user._id;

    // Add order note
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note: `Vendor payout status updated to ${
        is_paid ? 'PAID' : 'UNPAID'
      } for vendor ${vendor_id}`,
      added_by: req.user._id,
      note_type: 'INTERNAL',
      created_at: new Date(),
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Vendor payout status updated successfully',
    });
  } catch (error) {
    console.error('Update Payout Status Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while updating payout status.',
    });
  }
});

export {
  updateOrderStatus,
  updatePaymentStatus,
  updateDeliveryCharges,
  updatePayoutStatus,
};
