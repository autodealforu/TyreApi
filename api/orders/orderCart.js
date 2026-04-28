import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import Product from '../products/ProductModel.js';
import User from '../users/UserModel.js';
import mongoose from 'mongoose';

// @desc    Convert cart to order
// @route   POST /api/orders/cart-to-order
// @access  Private
const convertCartToOrder = asyncHandler(async (req, res) => {
  try {
    const {
      cart_items,
      shipping_address,
      billing_address,
      payment_method,
      coupon_code,
      delivery_option,
      installation_option,
    } = req.body;

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required',
      });
    }

    if (!shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    // Get user information
    const customer = await User.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Process products and group by vendor
    const vendorGroups = new Map();
    let totalAmount = 0;
    const orderProducts = [];

    for (const cartItem of cart_items) {
      const product = await Product.findById(cartItem.product)
        .populate('vendor', 'name store_name commission_rate')
        .populate('tyre', 'brand size specifications');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${cartItem.product} not found`,
        });
      }

      const quantity = cartItem.quantity || 1;
      const price = product.sale_price || product.regular_price;
      const productTotal = price * quantity;

      const orderProduct = {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: quantity,
        unit_price: price,
        total_price: productTotal,
        specifications: product.tyre?.specifications || {},
        vendor: product.vendor._id,
      };

      orderProducts.push(orderProduct);
      totalAmount += productTotal;

      // Group by vendor for commission calculation
      const vendorId = product.vendor._id.toString();
      if (!vendorGroups.has(vendorId)) {
        vendorGroups.set(vendorId, {
          vendor_id: product.vendor._id,
          vendor_name: product.vendor.name,
          store_name: product.vendor.store_name,
          commission_rate: product.vendor.commission_rate || 10,
          total_amount: 0,
          products: [],
        });
      }

      const vendorGroup = vendorGroups.get(vendorId);
      vendorGroup.total_amount += productTotal;
      vendorGroup.products.push(orderProduct);
    }

    // Calculate vendor commissions
    const vendorCommissions = Array.from(vendorGroups.values()).map(
      (vendor) => ({
        vendor: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
        store_name: vendor.store_name,
        total_amount: vendor.total_amount,
        commission_rate: vendor.commission_rate,
        commission_amount: (vendor.total_amount * vendor.commission_rate) / 100,
        payment_status: 'PENDING',
        products: vendor.products.map((p) => ({
          product: p.product,
          quantity: p.quantity,
          unit_price: p.unit_price,
          total_price: p.total_price,
        })),
      })
    );

    // Calculate charges
    const deliveryCharges = {
      STANDARD: 0,
      EXPRESS: 200,
      SAME_DAY: 500,
    };

    const installationCharges = {
      STORE: 0,
      HOME: 100,
      NONE: 0,
    };

    const delivery_charges = deliveryCharges[delivery_option] || 0;
    const installation_fee = installationCharges[installation_option] || 0;

    // Apply coupon discount (simplified)
    let discount_amount = 0;
    if (coupon_code) {
      // This would integrate with the coupon validation logic
      discount_amount = 100; // Mock discount
    }

    // Calculate tax (18% GST)
    const taxable_amount =
      totalAmount + delivery_charges + installation_fee - discount_amount;
    const tax_amount = Math.round(taxable_amount * 0.18);

    const final_amount =
      totalAmount +
      delivery_charges +
      installation_fee +
      tax_amount -
      discount_amount;

    // Create order
    const orderData = {
      order_number: `ORD-${Date.now()}`,
      customer: customer._id,
      customer_details: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      products: orderProducts,
      vendor_commissions: vendorCommissions,

      // Addresses
      shipping_address: {
        ...shipping_address,
        address_type: 'SHIPPING',
      },
      billing_address: billing_address || {
        ...shipping_address,
        address_type: 'BILLING',
      },

      // Pricing
      subtotal: totalAmount,
      delivery_charges: delivery_charges,
      installation_fee: installation_fee,
      tax_amount: tax_amount,
      discount_amount: discount_amount,
      total_amount: final_amount,

      // Order settings
      delivery_option: delivery_option || 'STANDARD',
      installation_option: installation_option || 'NONE',

      // Status
      status: 'PENDING',
      payment_status: 'PENDING',

      // Payment
      payment_details: {
        method: payment_method,
        gateway: null,
        transaction_id: null,
        amount: final_amount,
        currency: 'INR',
        status: 'PENDING',
      },

      // Timestamps
      order_date: new Date(),
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    const order = new Order(orderData);
    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('products.product', 'name sku images')
      .populate('vendor_commissions.vendor', 'name store_name');

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Order created successfully from cart',
    });
  } catch (error) {
    console.error('Convert Cart to Order Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while creating order from cart.',
    });
  }
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
const updateOrderPayment = asyncHandler(async (req, res) => {
  try {
    const {
      payment_gateway,
      transaction_id,
      payment_status,
      gateway_response,
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update payment details
    order.payment_details = {
      ...order.payment_details,
      gateway: payment_gateway,
      transaction_id: transaction_id,
      status: payment_status,
      gateway_response: gateway_response,
      paid_at: payment_status === 'COMPLETED' ? new Date() : null,
    };

    order.payment_status = payment_status;

    // Update order status based on payment
    if (payment_status === 'COMPLETED') {
      order.status = 'CONFIRMED';
      order.confirmed_at = new Date();
    } else if (payment_status === 'FAILED') {
      order.status = 'PAYMENT_FAILED';
    }

    await order.save();

    res.json({
      success: true,
      order: order,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    console.error('Update Order Payment Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while updating payment status.',
    });
  }
});

// @desc    Get order summary for checkout
// @route   GET /api/orders/:id/checkout-summary
// @access  Private
const getOrderCheckoutSummary = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('products.product', 'name sku images regular_price sale_price')
      .populate('vendor_commissions.vendor', 'name store_name location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to user (unless admin)
    if (
      req.user.role !== 'ADMIN' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const summary = {
      order_id: order._id,
      order_number: order.order_number,
      customer: order.customer,

      // Products summary
      products: order.products.map((product) => ({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        unit_price: product.unit_price,
        total_price: product.total_price,
        image: product.product.images?.[0] || null,
      })),

      // Vendors involved
      vendors: order.vendor_commissions.map((vc) => ({
        name: vc.vendor_name,
        store_name: vc.store_name,
        total_amount: vc.total_amount,
        product_count: vc.products.length,
      })),

      // Address information
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,

      // Pricing breakdown
      pricing: {
        subtotal: order.subtotal,
        delivery_charges: order.delivery_charges,
        installation_fee: order.installation_fee,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
      },

      // Delivery and installation
      delivery_option: order.delivery_option,
      installation_option: order.installation_option,
      estimated_delivery: order.estimated_delivery,

      // Status and payment
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_details?.method,

      // Timestamps
      order_date: order.order_date,
      confirmed_at: order.confirmed_at,
    };

    res.json({
      success: true,
      summary: summary,
      message: 'Order checkout summary retrieved successfully',
    });
  } catch (error) {
    console.error('Get Order Checkout Summary Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while fetching order summary.',
    });
  }
});

export { convertCartToOrder, updateOrderPayment, getOrderCheckoutSummary };
