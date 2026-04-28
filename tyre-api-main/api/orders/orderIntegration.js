import asyncHandler from 'express-async-handler';
import Cart from '../carts/CartModel.js';
import Order from './OrderModel.js';
import Product from '../products/ProductModel.js';
import Coupon from '../coupons/CouponModel.js';
import User from '../users/UserModel.js';

// @desc    Enhanced cart checkout flow
// @route   POST /api/orders/checkout-flow
// @access  Private
const processCheckoutFlow = asyncHandler(async (req, res) => {
  try {
    const {
      cart_id,
      shipping_address,
      billing_address,
      delivery_option,
      installation_option,
      coupon_code,
      payment_method,
      special_instructions,
    } = req.body;

    // Step 1: Validate and get cart
    let cartItems = [];

    if (cart_id) {
      const cart = await Cart.findOne({
        _id: cart_id,
        customer: req.user._id,
      }).populate('products.product');

      if (!cart || !cart.products || cart.products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty or not found',
        });
      }

      cartItems = cart.products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        specifications: item.specifications || {},
      }));
    } else {
      // Direct product purchase (buy now)
      cartItems = req.body.products || [];
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products specified for checkout',
      });
    }

    // Step 2: Validate all products and calculate pricing
    let orderCalculation = {
      products: [],
      subtotal: 0,
      delivery_charges: 0,
      installation_fee: 0,
      tax_amount: 0,
      discount_amount: 0,
      coupon_discount: 0,
      total_amount: 0,
      vendor_commissions: [],
    };

    const vendorGroups = new Map();

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.product)
        .populate('vendor', 'name store_name commission_rate location')
        .populate('tyre', 'brand size specifications');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${cartItem.product} not found`,
        });
      }

      // Check inventory
      if (product.stock_quantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${cartItem.quantity}`,
        });
      }

      const unitPrice = product.sale_price || product.regular_price;
      const totalPrice = unitPrice * cartItem.quantity;

      const orderProduct = {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        specifications: {
          ...product.tyre?.specifications,
          ...cartItem.specifications,
        },
        vendor: product.vendor._id,
      };

      orderCalculation.products.push(orderProduct);
      orderCalculation.subtotal += totalPrice;

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
      vendorGroup.total_amount += totalPrice;
      vendorGroup.products.push({
        product: product._id,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // Step 3: Calculate delivery charges
    const deliveryRates = {
      STANDARD: 0,
      EXPRESS: 200,
      SAME_DAY: 500,
    };
    orderCalculation.delivery_charges = deliveryRates[delivery_option] || 0;

    // Step 4: Calculate installation charges
    const installationRates = {
      STORE: 0,
      HOME: 100,
      NONE: 0,
    };
    orderCalculation.installation_fee =
      installationRates[installation_option] || 0;

    // Step 5: Apply coupon if provided
    if (coupon_code) {
      const coupon = await Coupon.findOne({
        code: coupon_code.toUpperCase(),
      });

      if (coupon) {
        const cartValue = orderCalculation.subtotal;
        const minCartValue = parseFloat(coupon.min_cart_value) || 0;

        if (cartValue >= minCartValue) {
          if (coupon.discount_type === 'PERCENTAGE') {
            const discountAmount =
              (cartValue * parseFloat(coupon.discount)) / 100;
            const maxDiscount =
              parseFloat(coupon.max_discount) || discountAmount;
            orderCalculation.coupon_discount = Math.min(
              discountAmount,
              maxDiscount
            );
          } else {
            orderCalculation.coupon_discount = parseFloat(coupon.discount);
          }
          orderCalculation.discount_amount = orderCalculation.coupon_discount;
        }
      }
    }

    // Step 6: Calculate tax (18% GST)
    const taxableAmount =
      orderCalculation.subtotal +
      orderCalculation.delivery_charges +
      orderCalculation.installation_fee -
      orderCalculation.discount_amount;
    orderCalculation.tax_amount = Math.round(taxableAmount * 0.18);

    // Step 7: Calculate final total
    orderCalculation.total_amount =
      orderCalculation.subtotal +
      orderCalculation.delivery_charges +
      orderCalculation.installation_fee +
      orderCalculation.tax_amount -
      orderCalculation.discount_amount;

    // Step 8: Create vendor commissions
    orderCalculation.vendor_commissions = Array.from(vendorGroups.values()).map(
      (vendor) => ({
        vendor: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
        store_name: vendor.store_name,
        total_amount: vendor.total_amount,
        commission_rate: vendor.commission_rate,
        commission_amount: (vendor.total_amount * vendor.commission_rate) / 100,
        payment_status: 'PENDING',
        products: vendor.products,
      })
    );

    // Step 9: Create the order
    const customer = await User.findById(req.user._id);

    const orderData = {
      order_number: `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
      customer: customer._id,
      customer_details: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },

      // Products and vendor information
      products: orderCalculation.products,
      vendor_commissions: orderCalculation.vendor_commissions,

      // Addresses
      shipping_address: {
        ...shipping_address,
        address_type: 'SHIPPING',
      },
      billing_address: billing_address
        ? {
            ...billing_address,
            address_type: 'BILLING',
          }
        : {
            ...shipping_address,
            address_type: 'BILLING',
          },

      // Pricing breakdown
      subtotal: orderCalculation.subtotal,
      delivery_charges: orderCalculation.delivery_charges,
      installation_fee: orderCalculation.installation_fee,
      tax_amount: orderCalculation.tax_amount,
      discount_amount: orderCalculation.discount_amount,
      total_amount: orderCalculation.total_amount,

      // Order preferences
      delivery_option: delivery_option || 'STANDARD',
      installation_option: installation_option || 'NONE',

      // Status tracking
      status: 'PENDING',
      payment_status: 'PENDING',

      // Payment information
      payment_details: {
        method: payment_method,
        gateway: null,
        transaction_id: null,
        amount: orderCalculation.total_amount,
        currency: 'INR',
        status: 'PENDING',
      },

      // Additional information
      special_instructions: special_instructions,

      // Timestamps
      order_date: new Date(),
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    // Add coupon information if applied
    if (coupon_code && orderCalculation.coupon_discount > 0) {
      orderData.coupon_applied = {
        code: coupon_code,
        discount_amount: orderCalculation.coupon_discount,
      };
    }

    const order = new Order(orderData);
    await order.save();

    // Step 10: Clear cart after successful order creation
    if (cart_id) {
      await Cart.findByIdAndDelete(cart_id);
    }

    // Step 11: Update product inventory (reserve stock)
    for (const product of orderCalculation.products) {
      await Product.findByIdAndUpdate(product.product, {
        $inc: { stock_quantity: -product.quantity },
      });
    }

    // Step 12: Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('products.product', 'name sku images regular_price sale_price')
      .populate(
        'vendor_commissions.vendor',
        'name store_name location contact_details'
      );

    res.status(201).json({
      success: true,
      order: populatedOrder,
      calculation: orderCalculation,
      next_steps: {
        payment_required: true,
        payment_amount: orderCalculation.total_amount,
        payment_methods: [
          'RAZORPAY',
          'PAYU',
          'STRIPE',
          'PHONEPE',
          'PAYTM',
          'COD',
        ],
      },
      message: 'Order created successfully. Proceed with payment.',
    });
  } catch (error) {
    console.error('Process Checkout Flow Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong during checkout.',
    });
  }
});

// @desc    Quick buy now (without cart)
// @route   POST /api/orders/buy-now
// @access  Private
const quickBuyNow = asyncHandler(async (req, res) => {
  try {
    const { product_id, quantity = 1, ...checkoutData } = req.body;

    // Convert single product to cart format
    const products = [
      {
        product: product_id,
        quantity: quantity,
      },
    ];

    // Use the checkout flow with products instead of cart_id
    req.body = {
      ...checkoutData,
      products: products,
    };

    // Call the checkout flow function
    await processCheckoutFlow(req, res);
  } catch (error) {
    console.error('Quick Buy Now Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong with quick purchase.',
    });
  }
});

// @desc    Get checkout summary before final order creation
// @route   POST /api/orders/checkout-preview
// @access  Private
const getCheckoutPreview = asyncHandler(async (req, res) => {
  try {
    const {
      cart_id,
      products,
      coupon_code,
      delivery_option,
      installation_option,
    } = req.body;

    let cartItems = [];

    if (cart_id) {
      const cart = await Cart.findOne({
        _id: cart_id,
        customer: req.user._id,
      }).populate('products.product');

      if (cart && cart.products) {
        cartItems = cart.products.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          specifications: item.specifications || {},
        }));
      }
    } else if (products) {
      cartItems = products;
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products found for preview',
      });
    }

    // Use the estimate calculation logic
    req.body = {
      products: cartItems,
      coupon_code,
      delivery_option,
      installation_option,
    };

    // Import and call the estimate function
    const { calculateOrderEstimate } = await import('./orderCheckout.js');
    await calculateOrderEstimate(req, res);
  } catch (error) {
    console.error('Get Checkout Preview Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while generating preview.',
    });
  }
});

export { processCheckoutFlow, quickBuyNow, getCheckoutPreview };
