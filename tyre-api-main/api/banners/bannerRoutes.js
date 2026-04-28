import express from "express";
const router = express.Router();

import {
  getBanners,
  getBannerById,
  deleteBanner,
  createBanner,
  updateBanner,
  getAllBanners,
} from "./bannerController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getBanners).post(protect, createBanner);
router.route("/all").get(getAllBanners);
router
  .route("/:id")
  .get(getBannerById)
  .delete(protect, admin, deleteBanner)
  .put(protect, updateBanner);

export default router;
