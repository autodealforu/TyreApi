import express from 'express';
const router = express.Router();

import {
  getProductcategorys,
  getProductcategoryById,
  deleteProductcategory,
  createProductcategory,
  updateProductcategory,
  getAllProductcategorys,
  getAllProductCategoriesHomepage,
} from './productcategoryController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getProductcategorys).post(protect, createProductcategory);
router.route('/homepage').get(getAllProductCategoriesHomepage);
router.route('/all').get(getAllProductcategorys);
router.route('/all').get(getAllProductcategorys);
router
  .route('/:id')
  .get(getProductcategoryById)
  .delete(protect, admin, deleteProductcategory)
  .put(protect, updateProductcategory);

export default router;
