import express from "express";
const router = express.Router();
import {
  getReviews,
  getReviewById,
  deleteReview,
  createReview,
  updateReview,
  getAllReviews,
} from "./reviewController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getReviews).post(createReview);
router.route("/all").get(getAllReviews);
router
  .route("/:id")
  .get(getReviewById)
  .delete(protect, admin, deleteReview)
  .put(protect, updateReview);

export default router;
