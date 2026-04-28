import express from 'express';
const router = express.Router();

import { admin, protect } from '../../middleware/authMiddleware.js';
import {
  createPart,
  deletePart,
  getAllParts,
  getPartById,
  getParts,
  updatePart,
} from './partController.js';

router.route('/').get(protect, getParts).post(protect, createPart);
router.route('/all').get(getAllParts);
router
  .route('/:id')
  .get(protect, getPartById)
  .delete(protect, admin, deletePart)
  .put(protect, updatePart);

export default router;
