import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import sendEmail from '../../utils/mail.js';
import { ORDER_UPDATE_TEMPLATE } from '../../utils/template/OrderStatusTemplate.js';
import Product from '../products/ProductModel.js';

const updateOrder = asyncHandler(async (req, res) => {
  try {
    const updateData = req.body;

    if (req.user) {
      updateData.updated_by = req.user._id;
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
        req.user.role === 'SUPER ADMIN' ||
        (req.user.role === 'VENDOR' &&
          order.products.some(
            (p) => p.vendor.toString() === req.user._id.toString()
          ));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message:
            'Access denied. You do not have permission to update this order.',
        });
      }
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.payment_details?.payment_status;

    // Handle products update if provided
    if (updateData.products && Array.isArray(updateData.products)) {
      const enrichedProducts = await Promise.all(
        updateData.products.map(async (productItem) => {
          const productDetails = await Product.findById(
            productItem.product
          ).populate('vendor', 'name email phone store_name location');

          if (!productDetails) {
            throw new Error(`Product with ID ${productItem.product} not found`);
          }

          // Ensure vendor is provided
          if (!productItem.vendor) {
            productItem.vendor = productDetails.vendor._id;
          }

          // Add vendor details to product
          if (productDetails.vendor) {
            productItem.vendor_details = {
              name: productDetails.vendor.name,
              store_name: productDetails.vendor.store_name || '',
              location: productDetails.vendor.location || '',
              phone: productDetails.vendor.phone || '',
            };
          }

          return productItem;
        })
      );
      updateData.products = enrichedProducts;
    }

    // Recalculate installation fee if products are updated
    if (updateData.products) {
      const totalInstallationFee = updateData.products.reduce(
        (total, product) => {
          return total + (product.installation_fee || 0) * product.quantity;
        },
        0
      );

      if (!updateData.installation_details) {
        updateData.installation_details = order.installation_details || {};
      }
      updateData.installation_details.total_installation_fee =
        totalInstallationFee;
    }

    // Update payment details if payment status changes
    if (
      updateData.is_paid !== undefined &&
      updateData.is_paid !== order.is_paid
    ) {
      if (!updateData.payment_details) {
        updateData.payment_details = order.payment_details || {};
      }

      if (updateData.is_paid) {
        updateData.payment_details.payment_status = 'SUCCESS';
        updateData.payment_details.payment_date = new Date();
        updateData.payment_details.payment_amount =
          updateData.total_amount || order.total_amount;
      } else {
        updateData.payment_details.payment_status = 'PENDING';
      }
    }

    // Update order fields
    Object.keys(updateData).forEach((key) => {
      if (
        key !== '_id' &&
        key !== 'order_id' &&
        key !== 'createdAt' &&
        key !== 'updatedAt'
      ) {
        order[key] = updateData[key];
      }
    });

    const updatedOrder = await order.save();

    // Populate the updated order for response
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('products.product', 'name slug brand size')
      .populate('products.vendor', 'name email phone store_name location')
      .populate('vendor_commissions.vendor', 'name email phone store_name')
      .populate('customer.customer', 'name email phone')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    // Send email notification if status changed
    const statusChanged = oldStatus !== updatedOrder.status;
    const paymentStatusChanged =
      oldPaymentStatus !== updatedOrder.payment_details?.payment_status;

    if (
      (statusChanged || paymentStatusChanged) &&
      updatedOrder.customer &&
      updatedOrder.customer.email
    ) {
      sendEmail({
        to: updatedOrder.customer.email,
        subject: `Your order #${updatedOrder.order_id} has been updated`,
        html: ORDER_UPDATE_TEMPLATE({ order: populatedOrder }),
      });
    }

    // Add order note for status change
    if (statusChanged && req.user) {
      if (!updatedOrder.order_notes) {
        updatedOrder.order_notes = [];
      }

      updatedOrder.order_notes.push({
        note: `Order status changed from ${oldStatus} to ${updatedOrder.status}`,
        added_by: req.user._id,
        note_type: 'INTERNAL',
        created_at: new Date(),
      });

      await updatedOrder.save();
    }

    res.json({
      success: true,
      order: populatedOrder,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while updating the order.',
    });
  }
});

export { updateOrder };
