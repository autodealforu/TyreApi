import express from "express";
const router = express.Router();

import {
  getCustomers,
  getCustomerById,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getAllCustomers,
} from "./customerController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(protect, getCustomers).post(protect, createCustomer);
router.route("/all").get(protect, getAllCustomers);
router
  .route("/:id")
  .get(protect, getCustomerById)
  .delete(protect, admin, deleteCustomer)
  .put(protect, updateCustomer);

export default router;
