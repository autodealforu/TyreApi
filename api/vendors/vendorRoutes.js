import express from 'express';
const router = express.Router();

import {
  getVendors,
  getVendorById,
  deleteVendor,
  createVendor,
  updateVendor,
  getAllVendors,
  addPickupAddress,
  getStoreStatsByState,
} from './vendorController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/stats/by-state').get(getStoreStatsByState);

router.route('/').get(getVendors).post(protect, admin, createVendor);
router
  .route('/:id/pickup-address')
  .get(protect, getVendorById)
  .post(addPickupAddress);
router.route('/all').get(protect, getAllVendors);
router
  .route('/:id')
  .get(protect, getVendorById)
  .delete(protect, admin, deleteVendor)
  .put(protect, updateVendor);

export default router;
