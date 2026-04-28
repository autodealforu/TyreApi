import express from "express";
const router = express.Router();

import {
  getCategorys,
  getCategoryById,
  deleteCategory,
  createCategory,
  updateCategory,
  getAllCategorys,
} from "./categoryController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getCategorys).post(protect, createCategory);
router.route("/all").get(getAllCategorys);
router
  .route("/:id")
  .get(getCategoryById)
  .delete(protect, admin, deleteCategory)
  .put(protect, updateCategory);

export default router;
