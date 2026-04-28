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
  getBrands,
  getBrandById,
  deleteBrand,
  createBrand,
  updateBrand,
  getAllBrands,
} from './brandController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getBrands).post(
  protect,

  createBrand
);
router.route('/all').get(getAllBrands);
router
  .route('/:id')
  .get(protect, getBrandById)
  .delete(protect, admin, deleteBrand)
  .put(protect, updateBrand);

export default router;
