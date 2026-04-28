import express from "express";
const router = express.Router();

import {
  getPages,
  getPageById,
  deletePage,
  createPage,
  updatePage,
  getAllPages,
} from "./pageController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getPages).post(protect, createPage);
router.route("/all").get(getAllPages);
router
  .route("/:id")
  .get(getPageById)
  .delete(protect, admin, deletePage)
  .put(protect, updatePage);

export default router;
