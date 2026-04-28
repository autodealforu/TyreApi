import express from "express";
const router = express.Router();
import {
  getCoupons,
  getCouponById,
  deleteCoupon,
  createCoupon,
  updateCoupon,
  getAllCoupons,
  validateCoupon,
} from "./couponController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getCoupons).post(protect, createCoupon);
router.route("/all").get(getAllCoupons);
router.route("/validate").post(validateCoupon);
router
  .route("/:id")
  .get(getCouponById)
  .delete(protect, admin, deleteCoupon)
  .put(protect, updateCoupon);

export default router;
