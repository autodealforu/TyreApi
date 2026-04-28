import express from 'express';
const router = express.Router();

import {
  getLoadIndexes,
  getLoadIndexById,
  getLoadIndexBySlug,
  deleteLoadIndex,
  createLoadIndex,
  updateLoadIndex,
  getAllLoadIndexes,
} from './loadIndexController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getLoadIndexes).post(protect, createLoadIndex);
router.route('/all').get(getAllLoadIndexes);
router
  .route('/:id')
  .get(protect, getLoadIndexById)
  .delete(protect, admin, deleteLoadIndex)
  .put(protect, updateLoadIndex);
router.route('/slug/:id').get(protect, getLoadIndexBySlug);

export default router;
