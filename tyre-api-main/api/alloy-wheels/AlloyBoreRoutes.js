import express from 'express';
const router = express.Router();

import {
  getAlloyBores,
  getAlloyBoreById,
  deleteAlloyBore,
  createAlloyBore,
  updateAlloyBore,
  getAllAlloyBores,
} from './alloyBoreController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getAlloyBores).post(protect, admin, createAlloyBore);
router.route('/all').get(getAllAlloyBores);
router
  .route('/:id')
  .get(getAlloyBoreById)
  .delete(protect, admin, deleteAlloyBore)
  .put(protect, admin, updateAlloyBore);

export default router;
