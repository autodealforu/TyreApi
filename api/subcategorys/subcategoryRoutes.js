import express from 'express';
import path from 'path';
const router = express.Router();
import multer from 'multer';
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });
import {
  getSubCategorys,
  getSubCategoryById,
  deleteSubCategory,
  createSubCategory,
  updateSubCategory,
  getAllSubCategorys,
  getAllSubCategorysPopulated,
} from './subcategoryController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getSubCategorys).post(
  protect,

  createSubCategory
);
router.route('/all').get(getAllSubCategorys);
router.route('/all-by-populated').get(getAllSubCategorysPopulated);
router
  .route('/:id')
  .get(protect, getSubCategoryById)
  .delete(protect, admin, deleteSubCategory)
  .put(
    protect,

    updateSubCategory
  );

export default router;
