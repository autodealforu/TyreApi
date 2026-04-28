import express from 'express';
const router = express.Router();

import {
  getProductTypes,
  getProductTypeById,
  getProductTypeBySlug,
  deleteProductType,
  createProductType,
  updateProductType,
  getAllProductTypes,
} from './productTypeController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getProductTypes)
  .post(protect, createProductType);
router.route('/all').get(getAllProductTypes);
router
  .route('/:id')
  .get(protect, getProductTypeById)
  .delete(protect, admin, deleteProductType)
  .put(protect, updateProductType);
router.route('/slug/:id').get(protect, getProductTypeBySlug);

export default router;
