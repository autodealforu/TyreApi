import express from 'express';
const router = express.Router();

import {
  getSpeedSymbols,
  getSpeedSymbolById,
  getSpeedSymbolBySlug,
  deleteSpeedSymbol,
  createSpeedSymbol,
  updateSpeedSymbol,
  getAllSpeedSymbols,
} from './speedSymbolController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

router
  .route('/')
  .get(protect, getSpeedSymbols)
  .post(protect, createSpeedSymbol);
router.route('/all').get(getAllSpeedSymbols);
router
  .route('/:id')
  .get(protect, getSpeedSymbolById)
  .delete(protect, admin, deleteSpeedSymbol)
  .put(protect, updateSpeedSymbol);
router.route('/slug/:id').get(protect, getSpeedSymbolBySlug);

export default router;
