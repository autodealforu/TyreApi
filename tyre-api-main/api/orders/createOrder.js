import asyncHandler from 'express-async-handler';
import checkRequired from '../../utils/checkRequired.js';
import sendEmail from '../../utils/mail.js';
import User from '../users/UserModel.js';
import Product from '../products/ProductModel.js';
import { NEW_USER_REGISTER_TEMPLATE } from '../../utils/template/NewRegisteredUser.js';
import { EMAIL_TEMPLATE } from '../../utils/template/Template.js';
import Notification from '../notifications/NotificationModel.js';
import Order from './OrderModel.js';

const createOrder = asyncHandler(async (req, res) => {
  try {
    var data = req.body;

    // Validate required fields
    if (
      !data.products ||
      !Array.isArray(data.products) ||
      data.products.length === 0
    ) {
      return res.status(400).json({ message: 'Products are required' });
    }

    if (!data.shipping_address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (
      !data.shipping_address.address_1 ||
      !data.shipping_address.city ||
      !data.shipping_address.pin
    ) {
      return res
        .status(400)
        .json({
          message: 'Shipping address must include address_1, city, and pin',
        });
    }

    // Handle customer creation/validation
    if (data.customer && data.customer.customer) {
      // Customer already exists
    } else {
      const { name, phone, email } = data.customer;

      if (!name || !phone) {
        return res
          .status(400)
          .json({ message: 'Customer name and phone are required' });
      }

      let userExists = null;
      if (email) {
        userExists = await User.findOne({ email });
      }

      if (userExists) {
        data.customer.customer = userExists._id;
      } else if (email) {
        // Create new customer account
        const newPassword = Math.floor(Math.random() * 1000000 + 1);
        const user = await User.create({
          name,
          username: email,
          email,
          password: newPassword,
          phone,
          role: 'CUSTOMER',
        });

        // Send welcome email
        sendEmail({
          to: user.email,
          subject: `Your Account has been created successfully`,
          html: NEW_USER_REGISTER_TEMPLATE({
            user: user,
            password: newPassword,
          }),
        });

        data.customer.customer = user._id;
      }
    }

    // Set created_by if user is authenticated
    if (req.user) {
      data.created_by = req.user._id;
    }

    // Process products and enrich with vendor details
    const enrichedProducts = await Promise.all(
      data.products.map(async (productItem) => {
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

    data.products = enrichedProducts;

    // Handle billing address (default to shipping if same_as_shipping is true)
    if (!data.billing_address || data.billing_address.same_as_shipping) {
      data.billing_address = {
        ...data.shipping_address,
        same_as_shipping: true,
      };
    }

    // Set default values for new fields
    data.delivery_details = data.delivery_details || {
      option: 'STANDARD',
      delivery_charges: data.delivery_charges || 0,
    };

    data.installation_details = data.installation_details || {
      option: 'STORE',
      total_installation_fee: 0,
    };

    // Calculate installation fee from products
    if (data.products) {
      const totalInstallationFee = data.products.reduce((total, product) => {
        return total + (product.installation_fee || 0) * product.quantity;
      }, 0);
      data.installation_details.total_installation_fee = totalInstallationFee;
    }

    // Set payment details
    if (data.payment_method === 'ONLINE' && data.payment_details) {
      data.payment_details.payment_status = data.is_paid
        ? 'SUCCESS'
        : 'PENDING';
      data.payment_details.payment_amount = data.total_amount;
      if (data.is_paid) {
        data.payment_details.payment_date = new Date();
      }
    }

    // Create coupon details if discount is applied
    if (data.discount > 0 && data.coupon_code) {
      data.coupon_details = {
        code: data.coupon_code,
        applied_discount: data.discount,
      };
    }

    // Create the order
    const order = new Order(data);
    const createdOrder = await order.save();

    // Populate the created order for response
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('products.product')
      .populate('products.vendor', 'name email phone store_name location')
      .populate('vendor_commissions.vendor', 'name email phone store_name')
      .populate('customer.customer', 'name email phone')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    // Send order confirmation email
    if (createdOrder.customer && createdOrder.customer.email) {
      try {
        sendEmail({
          to: createdOrder.customer.email,
          subject: `Your order #${createdOrder.order_id} has been placed successfully`,
          html: EMAIL_TEMPLATE({ order: populatedOrder }),
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the order creation if email fails
      }
    }

    // Create notifications for admin and vendors
    const notification = new Notification({
      notes: `<p>New Order #${createdOrder.order_id} of amount ₹${createdOrder.total_amount} has been received.</p>`,
      order: createdOrder._id,
    });
    await notification.save();

    // Create notifications for each vendor
    const vendors = [...new Set(data.products.map((p) => p.vendor.toString()))];
    await Promise.all(
      vendors.map(async (vendorId) => {
        const vendorNotification = new Notification({
          notes: `<p>New Order #${createdOrder.order_id} assigned to you. Please review and accept.</p>`,
          order: createdOrder._id,
          user: vendorId,
        });
        await vendorNotification.save();
      })
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong. Please try again.',
    });
  }
});

export { createOrder };
