import express from 'express';
const router = express.Router();

import { admin, protect } from '../../middleware/authMiddleware.js';
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  getVehicles,
  updateVehicle,
} from './vehicleController.js';

router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/all').get(getAllVehicles);
router
  .route('/:id')
  .get(protect, getVehicleById)
  .delete(protect, admin, deleteVehicle)
  .put(protect, updateVehicle);

export default router;
