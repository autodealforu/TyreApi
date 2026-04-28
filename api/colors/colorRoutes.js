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
  getColors,
  getColorById,
  deleteColor,
  createColor,
  updateColor,
  getAllColors,
} from './colorController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getColors).post(
  protect,

  createColor
);
router.route('/all').get(getAllColors);
router
  .route('/:id')
  .get(protect, getColorById)
  .delete(protect, admin, deleteColor)
  .put(protect, updateColor);

export default router;
