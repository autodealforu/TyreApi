import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  createUser,
  forgetUser,
  resetUser,
  registerVendor,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from './userController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { generateOTP, verifyOTP } from './usersContollerWebsite.js';
// router.route("/").post(registerUser).get(protect, admin, getUsers);
router.route('/websites/gerate-otp').post(generateOTP);
router.route('/websites/verify-otp').post(verifyOTP);
router.route('/register').post(registerUser);
router.route('/register-vendor').post(registerVendor);
router.route('/forget-password').post(forgetUser);
router.route('/reset-password').post(resetUser);
router.route('/').get(protect, admin, getUsers);
router.post('/login', authUser);
router.route('/add').post(createUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Address management routes
router
  .route('/:id/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addUserAddress);
router
  .route('/:id/addresses/:addressId')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
