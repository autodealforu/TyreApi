import express from "express";
const router = express.Router();

import {
  getCarts,
  getCartById,
  deleteCart,
  createCart,
  updateCart,
  getAllCarts,
} from "./cartController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getCarts).post(protect, createCart);
router.route("/all").get(protect, getAllCarts);
router
  .route("/:id")
  .get(protect, getCartById)
  .delete(protect, admin, deleteCart)
  .put(protect, updateCart);

export default router;
