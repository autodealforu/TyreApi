import express from "express";
const router = express.Router();

import {
  getContacts,
  getContactById,
  deleteContact,
  createContact,
  updateContact,
  getAllContacts,
} from "./contactController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getContacts).post(createContact);
router.route("/all").get(protect, getAllContacts);
router
  .route("/:id")
  .get(protect, getContactById)
  .delete(protect, admin, deleteContact)
  .put(protect, updateContact);

export default router;
