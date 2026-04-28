import express from "express";
import path from "path";
const router = express.Router();

import { getDashboards } from "./dashboardController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getDashboards);

export default router;
