import express from "express";
const router = express.Router();

import {
  getTestimonials,
  getTestimonialById,
  deleteTestimonial,
  createTestimonial,
  updateTestimonial,
  getAllTestimonials,
} from "./testimonialController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getTestimonials).post(protect, createTestimonial);
router.route("/all").get(getAllTestimonials);
router
  .route("/:id")
  .get(getTestimonialById)
  .delete(protect, admin, deleteTestimonial)
  .put(protect, updateTestimonial);

export default router;
