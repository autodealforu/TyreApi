import express from 'express';
const router = express.Router();

import {
  getWebsiteProducts,
  getWebsiteProductsBulk,
  getWebsiteProductsByCollection,
  getWebsiteProductsByCollectionHomepage,
  getWebsiteProductsByCategory,
  getWebsiteProductsByVendor,
  getWebsiteProductsBySubCategory,
  getWebsiteProductsBySubSubCategory,
  getWebsiteAllProducts,
  getWebsiteAllProductsSlug,
  getWebsiteProductBySlug,
  getWebsiteProductById,
} from './websiteProductController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getWebsiteProducts);
router.route('/bulk-get').get(getWebsiteProductsBulk);
router.route('/products').get(protect, getWebsiteProducts);

router.route('/collection/:slug').get(getWebsiteProductsByCollection);
router
  .route('/homepage/collection/:slug')
  .get(getWebsiteProductsByCollectionHomepage);
router.route('/categories/:cat').get(getWebsiteProductsByCategory);
router.route('/vendor/:vendor').get(getWebsiteProductsByVendor);
router.route('/categories/:cat/:sub_cat').get(getWebsiteProductsBySubCategory);
router
  .route('/categories/:cat/:sub_cat/:sub_sub_cat')
  .get(getWebsiteProductsBySubSubCategory);
router.route('/all').get(getWebsiteAllProducts);
router.route('/all-slug').get(getWebsiteAllProductsSlug);
router.route('/slug/:slug').get(getWebsiteProductBySlug);
router.route('/:id').get(getWebsiteProductById);

export default router;
