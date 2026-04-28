import express from 'express';
import {
  createUnifiedProduct,
  getUnifiedProducts,
  getUnifiedProductById,
  updateUnifiedProduct,
  deleteUnifiedProduct,
  getProductsByCategory,
} from './unifiedProductController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/products/unified
// @desc    Get all products with category filtering
// @access  Public
router.get('/', getUnifiedProducts);

// @route   GET /api/products/unified/category/:category
// @desc    Get products by specific category (TYRE, ALLOY_WHEEL, SERVICE)
// @access  Public
router.get('/category/:category', getProductsByCategory);

// @route   GET /api/products/unified/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getUnifiedProductById);

// @route   POST /api/products/unified
// @desc    Create a new unified product
// @access  Private
router.post('/', protect, createUnifiedProduct);

// @route   PUT /api/products/unified/:id
// @desc    Update a unified product
// @access  Private
router.put('/:id', protect, updateUnifiedProduct);

// @route   DELETE /api/products/unified/:id
// @desc    Delete a unified product
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUnifiedProduct);

export default router;
