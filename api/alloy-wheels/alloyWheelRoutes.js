import express from 'express';
const router = express.Router();

import {
  getAlloyWheels,
  getAlloyWheelById,
  deleteAlloyWheel,
  createAlloyWheel,
  updateAlloyWheel,
  getAllAlloyWheels,
} from './alloyWheelController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getAlloyWheels).post(protect, createAlloyWheel);
router.route('/all').get(protect, getAllAlloyWheels);
router
  .route('/:id')
  .get(getAlloyWheelById)
  .delete(protect, admin, deleteAlloyWheel)
  .put(protect, updateAlloyWheel);

export default router;
