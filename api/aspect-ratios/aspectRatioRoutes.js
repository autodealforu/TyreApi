import express from 'express';
const router = express.Router();

import {
  getAspectRatios,
  getAspectRatioById,
  getAspectRatioBySlug,
  deleteAspectRatio,
  createAspectRatio,
  updateAspectRatio,
  getAllAspectRatios,
} from './aspectRatioController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getAspectRatios)
  .post(protect, createAspectRatio);
router.route('/all').get(getAllAspectRatios);
router
  .route('/:id')
  .get(protect, getAspectRatioById)
  .delete(protect, admin, deleteAspectRatio)
  .put(protect, updateAspectRatio);
router.route('/slug/:id').get(protect, getAspectRatioBySlug);

export default router;
