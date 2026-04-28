import express from 'express';
const router = express.Router();

import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getAllProducts,
  getProductBySlug,
  getProductsByCollection,
  getProductsByCategory,
  getProductsBySubCategory,
  deleteBulkProduct,
  getProductsBySubSubCategory,
  getProductsByCollectionHomepage,
  deleteProductsBackup,
  getProductsByVendor,
  getAllProductsSlug,
  updateProductCategory,
  getProductsBulk,
} from './productController.js';
import {
  getWebsiteProducts,
  getFilterOptions,
} from './websiteProductsEnhanced.js';
import {
  getMultiVendorProducts,
  getProductWithVendors,
} from './multiVendorController.js';
import { getSingleProductWithVendors } from './singleProductController.js';
import { generateTyreReport, processBulkUploadCSV } from './tyreReport.js';
import {
  uploadCSV,
  handleCSVUploadError,
} from '../../config/csvUploadConfig.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getProducts).post(protect, createProduct);

// Website-specific routes for enhanced multi-product support
router.route('/website').get(getWebsiteProducts);
router.route('/website/filters/:type').get(getFilterOptions);

// Multi-vendor routes
router.route('/website/multi-vendor').get(getMultiVendorProducts);
router.route('/website/multi-vendor/:type/:specId').get(getProductWithVendors);

// Single product with all vendors route
router
  .route('/website/single-product/:type/:specId')
  .get(getSingleProductWithVendors);

router.route('/generate-tyre-report').get(protect, generateTyreReport);
router
  .route('/bulk-upload-csv')
  .post(protect, uploadCSV, handleCSVUploadError, processBulkUploadCSV);
router.route('/bulk-get').get(getProductsBulk);
router.route('/products').get(protect, getProducts);
router.route('/bulk').post(createProduct);

router.route('/collection/:slug').get(getProductsByCollection);
router.route('/homepage/collection/:slug').get(getProductsByCollectionHomepage);
router.route('/categories/:cat').get(getProductsByCategory);
router.route('/vendor/:vendor').get(getProductsByVendor);
router.route('/categories/:cat/:sub_cat').get(getProductsBySubCategory);
router
  .route('/categories/:cat/:sub_cat/:sub_sub_cat')
  .get(getProductsBySubSubCategory);
router.route('/all').get(getAllProducts);
router.route('/all-slug').get(getAllProductsSlug);
router.route('/slug/:slug').get(getProductBySlug);
router.route('/bulk-delete').post(protect, admin, deleteBulkProduct);
router.route('/old-delete').post(deleteProductsBackup);
router.route('/category-update/:id').put(updateProductCategory);
router.route('/bulk-update/:id').put(updateProduct);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, updateProduct);

export default router;
