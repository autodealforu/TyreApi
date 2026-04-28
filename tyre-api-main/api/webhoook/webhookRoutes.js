import express from "express";
const router = express.Router();
import { webookSetup } from "./webhookController.js";

router.route("/").post(webookSetup);

export default router;
