import express from 'express';
const router = express.Router();

import {
  getPlyRatings,
  getPlyRatingById,
  getPlyRatingBySlug,
  deletePlyRating,
  createPlyRating,
  updatePlyRating,
  getAllPlyRatings,
} from './plyRatingController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getPlyRatings).post(protect, createPlyRating);
router.route('/all').get(getAllPlyRatings);
router
  .route('/:id')
  .get(protect, getPlyRatingById)
  .delete(protect, admin, deletePlyRating)
  .put(protect, updatePlyRating);
router.route('/slug/:id').get(protect, getPlyRatingBySlug);

export default router;
