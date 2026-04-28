import express from 'express';
const router = express.Router();

import {
  getAlloyOffsets,
  getAlloyOffsetById,
  deleteAlloyOffset,
  createAlloyOffset,
  updateAlloyOffset,
  getAllAlloyOffsets,
} from './alloyOffsetController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getAlloyOffsets).post(protect, admin, createAlloyOffset);
router.route('/all').get(getAllAlloyOffsets);
router
  .route('/:id')
  .get(getAlloyOffsetById)
  .delete(protect, admin, deleteAlloyOffset)
  .put(protect, admin, updateAlloyOffset);

export default router;
