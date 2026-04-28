import express from "express";
const router = express.Router();

import {
  getNotifications,
  getNotificationById,
  deleteNotification,
  createNotification,
  updateNotification,
  getAllNotifications,
} from "./notificationController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getNotifications).post(createNotification);
router.route("/all").get(protect, getAllNotifications);
router
  .route("/:id")
  .get(protect, getNotificationById)
  .delete(protect, admin, deleteNotification)
  .put(protect, updateNotification);

export default router;
