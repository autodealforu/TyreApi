import express from 'express';
const router = express.Router();

import {
  getAlloyWidths,
  getAlloyWidthById,
  deleteAlloyWidth,
  createAlloyWidth,
  updateAlloyWidth,
  getAllAlloyWidths,
} from './alloyWidthController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getAlloyWidths).post(protect, admin, createAlloyWidth);
router.route('/all').get(getAllAlloyWidths);
router
  .route('/:id')
  .get(getAlloyWidthById)
  .delete(protect, admin, deleteAlloyWidth)
  .put(protect, admin, updateAlloyWidth);

export default router;
