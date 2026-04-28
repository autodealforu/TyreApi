import express from 'express';
const router = express.Router();
import {
  getMakeModels,
  getMakeModelById,
  deleteMakeModel,
  createMakeModel,
  updateMakeModel,
  getAllMakeModels,
} from './makeModelController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router.route('/').get(getMakeModels).post(protect, createMakeModel);
router.route('/all').get(getAllMakeModels);
router
  .route('/:id')
  .get(getMakeModelById)
  .delete(protect, admin, deleteMakeModel)
  .put(protect, updateMakeModel);

export default router;
