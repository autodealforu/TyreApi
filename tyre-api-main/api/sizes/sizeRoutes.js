import express from 'express';
import path from 'path';
const router = express.Router();

import {
  getSizes,
  getSizeById,
  deleteSize,
  createSize,
  updateSize,
  getAllSizes,
} from './sizeController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getSizes).post(
  protect,

  createSize
);
router.route('/all').get(getAllSizes);
router
  .route('/:id')
  .get(protect, getSizeById)
  .delete(protect, admin, deleteSize)
  .put(protect, updateSize);

export default router;
