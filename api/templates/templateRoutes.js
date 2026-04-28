import express from "express";
const router = express.Router();

import {
  getTemplates,
  getTemplateById,
  deleteTemplate,
  createTemplate,
  updateTemplate,
  getAllTemplates,
} from "./templateController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getTemplates).post(protect, createTemplate);
router.route("/all").get(protect, getAllTemplates);
router
  .route("/:id")
  .get(protect, getTemplateById)
  .delete(protect, admin, deleteTemplate)
  .put(protect, updateTemplate);

export default router;
