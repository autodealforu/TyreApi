import express from "express";
const router = express.Router();

import {
  getReturnrequests,
  getReturnrequestById,
  deleteReturnrequest,
  createReturnrequest,
  updateReturnrequest,
  getAllReturnrequests,
} from "./returnrequestController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router
  .route("/")
  .get(protect, getReturnrequests)
  .post(protect, createReturnrequest);
router.route("/all").get(protect, getAllReturnrequests);
router
  .route("/:id")
  .get(protect, getReturnrequestById)
  .delete(protect, admin, deleteReturnrequest)
  .put(protect, updateReturnrequest);

export default router;
