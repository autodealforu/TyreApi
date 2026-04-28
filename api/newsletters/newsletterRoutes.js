import express from "express";
const router = express.Router();

import {
  getNewsletters,
  getNewsletterById,
  deleteNewsletter,
  createNewsletter,
  updateNewsletter,
  getAllNewsletters,
} from "./newsletterController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getNewsletters).post(createNewsletter);
router.route("/all").get(protect, getAllNewsletters);
router
  .route("/:id")
  .get(protect, getNewsletterById)
  .delete(protect, admin, deleteNewsletter)
  .put(protect, updateNewsletter);

export default router;
