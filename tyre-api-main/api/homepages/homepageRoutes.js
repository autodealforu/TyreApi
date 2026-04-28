import express from 'express';
const router = express.Router();

import {
  getHomepages,
  getHomepageById,
  deleteHomepage,
  createHomepage,
  updateHomepage,
  getAllHomepages,
} from './homepageController.js';
import {
  getFeaturedProducts,
  getProductsByCategory,
} from './enhancedHomepageController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getHomepages).post(protect, createHomepage);
router.route('/all').get(getAllHomepages);

// Enhanced homepage routes for website
router.route('/featured-products').get(getFeaturedProducts);
router.route('/category/:type').get(getProductsByCategory);

router
  .route('/:id')
  .get(getHomepageById)
  .delete(protect, admin, deleteHomepage)
  .put(protect, updateHomepage);

export default router;
