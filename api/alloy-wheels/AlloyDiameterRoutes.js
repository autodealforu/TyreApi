import express from 'express';
const router = express.Router();

import {
  getAlloyDiameters,
  getAlloyDiameterById,
  deleteAlloyDiameter,
  createAlloyDiameter,
  updateAlloyDiameter,
  getAllAlloyDiameters,
} from './alloyDiameterController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(getAlloyDiameters)
  .post(protect, admin, createAlloyDiameter);
router.route('/all').get(getAllAlloyDiameters);
router
  .route('/:id')
  .get(getAlloyDiameterById)
  .delete(protect, admin, deleteAlloyDiameter)
  .put(protect, admin, updateAlloyDiameter);

export default router;
