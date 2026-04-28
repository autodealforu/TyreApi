import express from 'express';
const router = express.Router();

import { addBulk } from './AddBulk.js';
import { protect } from '../../middleware/authMiddleware.js';

router.route('/').post(protect, addBulk);

export default router;
