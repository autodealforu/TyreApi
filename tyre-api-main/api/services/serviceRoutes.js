import express from 'express';
const router = express.Router();

import {
  getServices,
  getServiceById,
  deleteService,
  createService,
  updateService,
  getAllServices,
  getServicesByCategory,
} from './serviceController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

// Main service routes
router.route('/').get(getServices).post(protect, createService);
router.route('/all').get(getAllServices);
router.route('/category/:category').get(getServicesByCategory);

// Individual service routes
router
  .route('/:id')
  .get(getServiceById)
  .delete(protect, admin, deleteService)
  .put(protect, updateService);

export default router;
