import express from "express";
const router = express.Router();

import {
  getBlogcategorys,
  getBlogcategoryById,
  deleteBlogcategory,
  createBlogcategory,
  updateBlogcategory,
  getAllBlogcategorys,
} from "./blogcategoryController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getBlogcategorys).post(protect, createBlogcategory);
router.route("/all").get(getAllBlogcategorys);
router
  .route("/:id")
  .get(getBlogcategoryById)
  .delete(protect, admin, deleteBlogcategory)
  .put(protect, updateBlogcategory);

export default router;
