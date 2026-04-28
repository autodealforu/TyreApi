import express from 'express';
const router = express.Router();

import {
  getMobileAppProducts,
  getMobileAppProductsByCollection,
  getMobileAppProductsByCollectionHomepage,
  getMobileAppProductsByCategory,
  getMobileAppProductsByVendor,
  getMobileAppProductsBySubCategory,
  getMobileAppProductsBySubSubCategory,
  getMobileAppAllProducts,
  getMobileAppAllProductsSlug,
  getMobileAppProductBySlug,
  getMobileAppProductById,
} from './mobileAppProductController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getMobileAppProducts);
router.route('/products').get(protect, getMobileAppProducts);

router.route('/collection/:id').get(getMobileAppProductsByCollection);
router
  .route('/homepage/collection/:slug')
  .get(getMobileAppProductsByCollectionHomepage);
router.route('/categories/:id').get(getMobileAppProductsByCategory);
router.route('/vendor/:vendor').get(getMobileAppProductsByVendor);
router.route('/sub-categories/:sub_cat').get(getMobileAppProductsBySubCategory);
router
  .route('/sub-sub-categories/:sub_sub_cat')
  .get(getMobileAppProductsBySubSubCategory);
router.route('/all').get(getMobileAppAllProducts);
router.route('/all-slug').get(getMobileAppAllProductsSlug);
router.route('/slug/:slug').get(getMobileAppProductBySlug);
router.route('/:id').get(getMobileAppProductById);

export default router;
