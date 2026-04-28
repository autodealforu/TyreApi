import express from 'express';
const router = express.Router();

import { admin, protect } from '../../middleware/authMiddleware.js';
import {
  createTechnician,
  deleteTechnician,
  getAllTechnicians,
  getTechnicianById,
  getTechnicians,
  updateTechnician,
} from './technicianController.js';

router.route('/').get(protect, getTechnicians).post(protect, createTechnician);
router.route('/all').get(getAllTechnicians);
router
  .route('/:id')
  .get(protect, getTechnicianById)
  .delete(protect, admin, deleteTechnician)
  .put(protect, updateTechnician);

export default router;
