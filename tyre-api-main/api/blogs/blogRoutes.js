import express from "express";
const router = express.Router();

import {
  getBlogs,
  getBlogById,
  deleteBlog,
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlogBySlug,
} from "./blogController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getBlogs).post(protect, createBlog);
router.route("/all").get(getAllBlogs);
router.route("/slug/:slug").get(getBlogBySlug);
router
  .route("/:id")
  .get(getBlogById)
  .delete(protect, admin, deleteBlog)
  .put(protect, updateBlog);

export default router;
