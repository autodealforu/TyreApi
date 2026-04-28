import express from 'express';
const router = express.Router();

import {
  getAlloyPCDs,
  getAlloyPCDById,
  deleteAlloyPCD,
  createAlloyPCD,
  updateAlloyPCD,
  getAllAlloyPCDs,
} from './alloyPCDController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getAlloyPCDs).post(protect, admin, createAlloyPCD);
router.route('/all').get(getAllAlloyPCDs);
router
  .route('/:id')
  .get(getAlloyPCDById)
  .delete(protect, admin, deleteAlloyPCD)
  .put(protect, admin, updateAlloyPCD);

export default router;
