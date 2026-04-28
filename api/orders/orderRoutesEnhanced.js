import express from 'express';
import {
  protect,
  admin,
  adminOrVendor,
} from '../../middleware/authMiddleware.js';

// Import enhanced order controllers
import {
  createOrder,
  getOrders,
  getOrderByID,
  updateOrder,
  deleteOrder,
} from './createOrder.js';
import { getOrdersAsPerNeed } from './getOrders.js';
import { getOrderByIdAsPerNeed } from './getOrderByID.js';
import {
  addOrderNote,
  getOrderNotes,
  scheduleInstallation,
  updateInstallationStatus,
  getVendorOrders,
  updateVendorCommissionStatus,
  getOrderAnalytics,
} from './orderExtensions.js';
import {
  calculateOrderEstimate,
  validateCoupon,
  checkDeliveryAvailability,
  getInstallationOptions,
} from './orderCheckout.js';
import {
  convertCartToOrder,
  updateOrderPayment,
  getOrderCheckoutSummary,
} from './orderCart.js';
import {
  getOrderTracking,
  updateOrderStatus as updateOrderStatusNew,
  cancelOrder,
  getCustomerOrders,
} from './orderTracking.js';
import {
  processCheckoutFlow,
  quickBuyNow,
  getCheckoutPreview,
} from './orderIntegration.js';

// Import legacy controllers (for backward compatibility)
import { getAllOrders } from './getAllOrders.js';
import {
  updateDeliveryCharges,
  updateOrderStatus,
  updatePaymentStatus,
  updatePayoutStatus,
} from './upateOrderStatus.js';
import {
  checkEstimate,
  createOrderPickup,
  getOrderTracking as getOrderTrackingLegacy,
} from './orderShippingDetails.js';
import { orderDimensionsUpdate } from './orderDimensionUpdate.js';

const router = express.Router();

// ========== ENHANCED E-COMMERCE CHECKOUT FLOW ==========

// Pre-checkout estimation and validation
router.post('/estimate', calculateOrderEstimate);
router.post('/validate-coupon', validateCoupon);
router.post('/check-delivery', checkDeliveryAvailability);
router.post('/installation-options', getInstallationOptions);

// Enhanced checkout flow
router.post('/checkout-flow', protect, processCheckoutFlow);
router.post('/checkout-preview', protect, getCheckoutPreview);
router.post('/buy-now', protect, quickBuyNow);

// Cart to order conversion
router.post('/cart-to-order', protect, convertCartToOrder);

// Order checkout and payment
router.get('/:id/checkout-summary', protect, getOrderCheckoutSummary);
router.put('/:id/payment', protect, updateOrderPayment);

// ========== ORDER TRACKING AND MANAGEMENT ==========

// Public order tracking (with order number + email)
router.get('/:id/tracking', getOrderTracking);

// Customer order history
router.get('/my-orders', protect, getCustomerOrders);

// Order status management (enhanced)
router.put('/:id/status', protect, adminOrVendor, updateOrderStatusNew);
router.put('/:id/cancel', protect, cancelOrder);

// ========== CORE ORDER OPERATIONS ==========

// Basic order CRUD
router.route('/').get(protect, getOrders).post(protect, createOrder);

// Enhanced order retrieval
router.get('/enhanced', protect, getOrdersAsPerNeed);

// Individual order operations
router
  .route('/:id')
  .get(protect, getOrderByID)
  .put(protect, adminOrVendor, updateOrder)
  .delete(protect, admin, deleteOrder);

// Enhanced individual order retrieval
router.get('/:id/enhanced', protect, getOrderByIdAsPerNeed);

// ========== ORDER COMMUNICATION SYSTEM ==========

// Order notes system
router.post('/:id/notes', protect, addOrderNote);
router.get('/:id/notes', protect, getOrderNotes);

// ========== INSTALLATION MANAGEMENT ==========

// Installation scheduling and tracking
router.post(
  '/:id/schedule-installation',
  protect,
  adminOrVendor,
  scheduleInstallation
);
router.put(
  '/:id/installation-status',
  protect,
  adminOrVendor,
  updateInstallationStatus
);

// ========== VENDOR MANAGEMENT ==========

// Vendor specific routes
router.get('/vendor/my-orders', protect, getVendorOrders);
router.put(
  '/vendor/commission/:commissionId',
  protect,
  updateVendorCommissionStatus
);

// ========== ANALYTICS AND REPORTING ==========

// Order analytics
router.get('/analytics/overview', protect, admin, getOrderAnalytics);

// ========== LEGACY ROUTES (For Backward Compatibility) ==========

// Legacy order listing
router.get('/all', protect, getAllOrders);

// Legacy status updates
router.put('/:id/payment-status', protect, updatePaymentStatus);
router.put('/:id/delivery-charges', protect, updateDeliveryCharges);
router.put('/:id/payout-status', protect, updatePayoutStatus);

// Legacy shipping integration
router.post('/:id/shipping/check-estimate', protect, checkEstimate);
router.post('/:id/shipping/create-pickup', protect, createOrderPickup);
router.post('/:id/shipping/track-order', protect, getOrderTrackingLegacy);
router.post('/:id/shipping/dimension-updates', protect, orderDimensionsUpdate);

// Legacy vendor routes
router.get('/vendor/:vendorId', protect, getVendorOrders);

// Legacy installation routes
router.put('/:id/installation/schedule', protect, scheduleInstallation);
router.put('/:id/installation/status', protect, updateInstallationStatus);

export default router;
