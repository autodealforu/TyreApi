import express from 'express';
const router = express.Router();

import { admin, protect } from '../../middleware/authMiddleware.js';
import {
  createCustomerAndVehicle,
  createJobCard,
  deleteJobCard,
  getAllJobCards,
  getJobCardById,
  getJobCards,
  getUserAndVehicle,
  updateJobCard,
  syncAllOrdersToJobCards,
  cancelJobCardByCustomer,
} from './jobCardController.js';

router.route('/').get(protect, getJobCards).post(protect, createJobCard);
router.post('/sync', syncAllOrdersToJobCards);
router.put('/:id/cancel', protect, cancelJobCardByCustomer);
router.post('/getUserAndVehicle', getUserAndVehicle);
router.post('/createCustomerAndVehicle', createCustomerAndVehicle);

router.route('/all').get(protect, getAllJobCards);
router
  .route('/:id')
  .get(getJobCardById)
  .delete(protect, admin, deleteJobCard)
  .put(protect, updateJobCard);

export default router;
