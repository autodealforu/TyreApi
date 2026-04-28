import express from 'express';
import path from 'path';
const router = express.Router();

import {
  getTyres,
  getTyreById,
  deleteTyre,
  createTyre,
  updateTyre,
  getAllTyres,
} from './tyreController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(protect, getTyres).post(protect, createTyre);
router.route('/all').get(protect, getAllTyres);
router
  .route('/:id')
  .get(getTyreById)
  .delete(protect, admin, deleteTyre)
  .put(protect, updateTyre);

export default router;
