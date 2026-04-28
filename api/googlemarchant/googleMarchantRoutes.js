import express from "express";
const router = express.Router();
import { getAllProducts } from './googleMarchantController.js';

router.route("/xml").get(getAllProducts);
export default router;
