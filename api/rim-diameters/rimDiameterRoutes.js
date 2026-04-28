import express from 'express';
const router = express.Router();

import {
  getRimDiameters,
  getRimDiameterById,
  getRimDiameterBySlug,
  deleteRimDiameter,
  createRimDiameter,
  updateRimDiameter,
  getAllRimDiameters,
} from './rimDiameterController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getRimDiameters)
  .post(protect, createRimDiameter);
router.route('/all').get(getAllRimDiameters);
router
  .route('/:id')
  .get(protect, getRimDiameterById)
  .delete(protect, admin, deleteRimDiameter)
  .put(protect, updateRimDiameter);
router.route('/slug/:id').get(protect, getRimDiameterBySlug);

export default router;
