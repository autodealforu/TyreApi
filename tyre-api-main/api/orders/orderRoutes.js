import express from 'express';
const router = express.Router();

import { protect, admin } from '../../middleware/authMiddleware.js';
import { createOrder } from './createOrder.js';
import { getOrders } from './getOrders.js';
import { getOrderById } from './getOrderByID.js';
import { deleteOrder } from './deleteOrder.js';
import { updateOrder } from './updateOrder.js';
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
  getOrderTracking,
} from './orderShippingDetails.js';
import { orderDimensionsUpdate } from './orderDimensionUpdate.js';
import {
  addOrderNote,
  getOrderNotes,
  scheduleInstallation,
  updateInstallationStatus,
  getVendorOrders,
} from './orderExtensions.js';
import { getCustomerOrders } from './getCustomerOrders.js';
// ...existing code...

// Basic CRUD routes
router.route('/').get(protect, getOrders).post(createOrder);
router.route('/all').get(protect, getAllOrders);
router
  .route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder)
  .put(protect, updateOrder);

// Status update routes
router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/payment-status').put(protect, updatePaymentStatus);
router.route('/:id/delivery-charges').put(protect, updateDeliveryCharges);
router.route('/:id/payout-status').put(protect, updatePayoutStatus);

// Order notes routes
router
  .route('/:id/notes')
  .get(protect, getOrderNotes)
  .post(protect, addOrderNote);

// Installation routes
router.route('/:id/installation/schedule').put(protect, scheduleInstallation);
router.route('/:id/installation/status').put(protect, updateInstallationStatus);

// Vendor specific routes
router.route('/vendor/:vendorId').get(protect, getVendorOrders);

// Customer specific route
router.route('/customer/:customerId').get(protect, getCustomerOrders);

// ...existing code...

// Shipping routes
router.route('/:id/shipping/check-estimate').post(protect, checkEstimate);
router.route('/:id/shipping/create-pickup').post(protect, createOrderPickup);
router.route('/:id/shipping/track-order').post(protect, getOrderTracking);
router
  .route('/:id/shipping/dimension-updates')
  .post(protect, orderDimensionsUpdate);

export default router;
