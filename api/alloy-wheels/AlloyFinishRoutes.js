import express from 'express';
const router = express.Router();

import {
  getAlloyFinishes,
  getAlloyFinishById,
  deleteAlloyFinish,
  createAlloyFinish,
  updateAlloyFinish,
  getAllAlloyFinishes,
} from './alloyFinishController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getAlloyFinishes).post(protect, admin, createAlloyFinish);
router.route('/all').get(getAllAlloyFinishes);
router
  .route('/:id')
  .get(getAlloyFinishById)
  .delete(protect, admin, deleteAlloyFinish)
  .put(protect, admin, updateAlloyFinish);

export default router;
