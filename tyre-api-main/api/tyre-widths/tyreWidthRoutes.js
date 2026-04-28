import express from 'express';
const router = express.Router();

import {
  getTyreWidths,
  getTyreWidthById,
  getTyreWidthBySlug,
  deleteTyreWidth,
  createTyreWidth,
  updateTyreWidth,
  getAllTyreWidths,
} from './tyreWidthController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getTyreWidths).post(protect, createTyreWidth);
router.route('/all').get(getAllTyreWidths);
router
  .route('/:id')
  .get(protect, getTyreWidthById)
  .delete(protect, admin, deleteTyreWidth)
  .put(protect, updateTyreWidth);
router.route('/slug/:id').get(protect, getTyreWidthBySlug);

export default router;
