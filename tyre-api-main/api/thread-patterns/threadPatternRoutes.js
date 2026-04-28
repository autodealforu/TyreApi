import express from 'express';
const router = express.Router();

import {
  getThreadPatterns,
  getThreadPatternById,
  getThreadPatternBySlug,
  deleteThreadPattern,
  createThreadPattern,
  updateThreadPattern,
  getAllThreadPatterns,
} from './threadPatternController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getThreadPatterns)
  .post(protect, createThreadPattern);
router.route('/all').get(getAllThreadPatterns);
router
  .route('/:id')
  .get(protect, getThreadPatternById)
  .delete(protect, admin, deleteThreadPattern)
  .put(protect, updateThreadPattern);
router.route('/slug/:id').get(protect, getThreadPatternBySlug);

export default router;
