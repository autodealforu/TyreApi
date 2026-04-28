import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import Product from '../products/ProductModel.js';
import Coupon from '../coupons/CouponModel.js';
import User from '../users/UserModel.js';

// @desc    Calculate order estimate (pre-checkout)
// @route   POST /api/orders/estimate
// @access  Public
const calculateOrderEstimate = asyncHandler(async (req, res) => {
  try {
    const {
      products,
      shipping_address,
      coupon_code,
      delivery_option,
      installation_option,
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products are required for estimation',
      });
    }

    let estimateDetails = {
      products: [],
      subtotal: 0,
      installation_fee: 0,
      delivery_charges: 0,
      tax: 0,
      discount: 0,
      coupon_discount: 0,
      total: 0,
      savings: 0,
      available_vendors: [],
      delivery_estimate: null,
      installation_estimate: null,
    };

    // Process each product
    for (const productItem of products) {
      const product = await Product.findById(productItem.product)
        .populate('vendor', 'name store_name location delivery_zones')
        .populate('tyre', 'brand size specifications');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productItem.product} not found`,
        });
      }

      const quantity = productItem.quantity || 1;
      const price = product.sale_price || product.regular_price;
      const installation_fee = productItem.installation_fee || 0;

      const productEstimate = {
        product: product._id,
        name: product.name,
        brand: product.tyre?.brand,
        size: product.tyre?.size,
        quantity: quantity,
        unit_price: price,
        total_price: price * quantity,
        installation_fee: installation_fee * quantity,
        vendor: {
          id: product.vendor._id,
          name: product.vendor.name,
          store_name: product.vendor.store_name,
          location: product.vendor.location,
        },
      };

      estimateDetails.products.push(productEstimate);
      estimateDetails.subtotal += productEstimate.total_price;
      estimateDetails.installation_fee += productEstimate.installation_fee;

      // Track unique vendors
      if (
        !estimateDetails.available_vendors.find(
          (v) => v.id.toString() === product.vendor._id.toString()
        )
      ) {
        estimateDetails.available_vendors.push(productEstimate.vendor);
      }
    }

    // Calculate delivery charges based on option and location
    const deliveryRates = {
      STANDARD: 0,
      EXPRESS: 200,
      SAME_DAY: 500,
    };
    estimateDetails.delivery_charges = deliveryRates[delivery_option] || 0;

    // Calculate delivery estimate
    const deliveryEstimates = {
      STANDARD: { days: 5, description: '5-7 business days' },
      EXPRESS: { days: 2, description: '2-3 business days' },
      SAME_DAY: { days: 0, description: 'Same day delivery' },
    };
    estimateDetails.delivery_estimate =
      deliveryEstimates[delivery_option] || deliveryEstimates.STANDARD;

    // Calculate installation estimate
    if (installation_option === 'HOME') {
      estimateDetails.installation_estimate = {
        available: true,
        additional_charges: 100,
        description: 'Home installation available (additional charges apply)',
      };
    } else if (installation_option === 'STORE') {
      estimateDetails.installation_estimate = {
        available: true,
        additional_charges: 0,
        description: 'Free installation at store',
      };
    }

    // Apply coupon if provided
    if (coupon_code) {
      const coupon = await Coupon.findOne({
        code: coupon_code.toUpperCase(),
        // Add validation for active coupons, expiry, etc.
      });

      if (coupon) {
        const cartValue = estimateDetails.subtotal;
        const minCartValue = parseFloat(coupon.min_cart_value) || 0;

        if (cartValue >= minCartValue) {
          if (coupon.discount_type === 'PERCENTAGE') {
            const discountAmount =
              (cartValue * parseFloat(coupon.discount)) / 100;
            const maxDiscount =
              parseFloat(coupon.max_discount) || discountAmount;
            estimateDetails.coupon_discount = Math.min(
              discountAmount,
              maxDiscount
            );
          } else {
            estimateDetails.coupon_discount = parseFloat(coupon.discount);
          }
          estimateDetails.discount = estimateDetails.coupon_discount;
        }
      }
    }

    // Calculate tax (18% GST)
    const taxableAmount =
      estimateDetails.subtotal +
      estimateDetails.installation_fee +
      estimateDetails.delivery_charges -
      estimateDetails.discount;
    estimateDetails.tax = Math.round(taxableAmount * 0.18);

    // Calculate total
    estimateDetails.total =
      estimateDetails.subtotal +
      estimateDetails.installation_fee +
      estimateDetails.delivery_charges +
      estimateDetails.tax -
      estimateDetails.discount;

    // Calculate savings
    estimateDetails.savings = estimateDetails.products.reduce(
      (total, product) => {
        // Assuming regular_price vs sale_price difference as savings
        return total + estimateDetails.discount;
      },
      0
    );

    res.json({
      success: true,
      estimate: estimateDetails,
      message: 'Order estimate calculated successfully',
    });
  } catch (error) {
    console.error('Calculate Order Estimate Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while calculating estimate.',
    });
  }
});

// @desc    Validate coupon code
// @route   POST /api/orders/validate-coupon
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const { coupon_code, cart_value, products } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({
      code: coupon_code.toUpperCase(),
    }).populate('product_collection product_category');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Check minimum cart value
    const minCartValue = parseFloat(coupon.min_cart_value) || 0;
    if (cart_value < minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${minCartValue} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = (cart_value * parseFloat(coupon.discount)) / 100;
      const maxDiscount = parseFloat(coupon.max_discount) || discountAmount;
      discountAmount = Math.min(discountAmount, maxDiscount);
    } else {
      discountAmount = parseFloat(coupon.discount);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount,
        discount_amount: discountAmount,
        min_cart_value: minCartValue,
        max_discount: coupon.max_discount,
      },
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while validating coupon.',
    });
  }
});

// @desc    Check delivery availability
// @route   POST /api/orders/check-delivery
// @access  Public
const checkDeliveryAvailability = asyncHandler(async (req, res) => {
  try {
    const { pincode, products } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required',
      });
    }

    // Mock delivery zones - in real app, this would be from a delivery zones collection
    const deliveryZones = {
      400001: {
        zone: 'Mumbai Central',
        available: true,
        standard_days: 2,
        express_days: 1,
        same_day: true,
      },
      400002: {
        zone: 'Mumbai South',
        available: true,
        standard_days: 2,
        express_days: 1,
        same_day: true,
      },
      110001: {
        zone: 'Delhi Central',
        available: true,
        standard_days: 3,
        express_days: 2,
        same_day: false,
      },
      560001: {
        zone: 'Bangalore Central',
        available: true,
        standard_days: 4,
        express_days: 3,
        same_day: false,
      },
    };

    const deliveryInfo = deliveryZones[pincode] || {
      zone: 'Extended Area',
      available: true,
      standard_days: 7,
      express_days: 5,
      same_day: false,
    };

    if (!deliveryInfo.available) {
      return res.status(400).json({
        success: false,
        message: 'Delivery not available in this area',
      });
    }

    const deliveryOptions = [
      {
        option: 'STANDARD',
        name: 'Standard Delivery',
        charges: 0,
        estimated_days: deliveryInfo.standard_days,
        description: `Free delivery in ${deliveryInfo.standard_days} days`,
        available: true,
      },
      {
        option: 'EXPRESS',
        name: 'Express Delivery',
        charges: 200,
        estimated_days: deliveryInfo.express_days,
        description: `Express delivery in ${deliveryInfo.express_days} days`,
        available: true,
      },
    ];

    if (deliveryInfo.same_day) {
      deliveryOptions.push({
        option: 'SAME_DAY',
        name: 'Same Day Delivery',
        charges: 500,
        estimated_days: 0,
        description: 'Same day delivery (order before 12 PM)',
        available: true,
      });
    }

    res.json({
      success: true,
      delivery_info: {
        pincode,
        zone: deliveryInfo.zone,
        available: deliveryInfo.available,
        options: deliveryOptions,
      },
      message: 'Delivery options retrieved successfully',
    });
  } catch (error) {
    console.error('Check Delivery Availability Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while checking delivery.',
    });
  }
});

// @desc    Get installation options
// @route   POST /api/orders/installation-options
// @access  Public
const getInstallationOptions = asyncHandler(async (req, res) => {
  try {
    const { products, location } = req.body;

    const installationOptions = [
      {
        option: 'STORE',
        name: 'Store Installation',
        charges: 0,
        description: 'Free installation at our authorized stores',
        available: true,
        estimated_time: '1-2 hours',
        benefits: [
          'Professional installation',
          'Quality guarantee',
          'Free wheel balancing',
        ],
      },
      {
        option: 'HOME',
        name: 'Home Installation',
        charges: 100,
        description: 'Installation at your doorstep',
        available: true,
        estimated_time: '2-3 hours',
        benefits: [
          'Convenient at-home service',
          'Professional technician',
          'Quality guarantee',
        ],
        additional_info: 'Additional charges may apply for certain locations',
      },
      {
        option: 'NONE',
        name: 'No Installation',
        charges: 0,
        description: 'Product delivery only',
        available: true,
        estimated_time: 'N/A',
        benefits: ['Lower cost', 'Self installation'],
      },
    ];

    // Check vendor availability for location-based installation
    if (location && location.pincode) {
      // Mock vendor availability check
      const vendorAvailability = [
        '400001',
        '400002',
        '110001',
        '560001',
      ].includes(location.pincode);

      if (!vendorAvailability) {
        installationOptions[1].available = false;
        installationOptions[1].description += ' (Not available in your area)';
      }
    }

    res.json({
      success: true,
      installation_options: installationOptions,
      message: 'Installation options retrieved successfully',
    });
  } catch (error) {
    console.error('Get Installation Options Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Something went wrong while fetching installation options.',
    });
  }
});

export {
  calculateOrderEstimate,
  validateCoupon,
  checkDeliveryAvailability,
  getInstallationOptions,
};
