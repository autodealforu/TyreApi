import express from 'express';
const router = express.Router();

import {
  getSubSubSubSubCategorys,
  getSubSubSubSubCategoryById,
  getSubSubSubSubCategoryBySlug,
  deleteSubSubSubSubCategory,
  createSubSubSubSubCategory,
  updateSubSubSubSubCategory,
  getAllSubSubSubSubCategorys,
} from './subsubsubsubcategoryController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getSubSubSubSubCategorys)
  .post(protect, createSubSubSubSubCategory);
router.route('/all').get(getAllSubSubSubSubCategorys);
router
  .route('/:id')
  .get(protect, getSubSubSubSubCategoryById)
  .delete(protect, admin, deleteSubSubSubSubCategory)
  .put(protect, updateSubSubSubSubCategory);
router.route('/slug/:id').get(protect, getSubSubSubSubCategoryBySlug);

export default router;
