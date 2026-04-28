import asyncHandler from 'express-async-handler';
import generateToken from '../../utils/generateToken.js';
import sendEmail from '../../utils/mail.js';
import User from './UserModel.js';
import { FORGET_PASSWORD_TEMPLATE } from '../../utils/template/ForgetPassword.js';
import jwt from 'jsonwebtoken';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    if (user.role === 'VENDOR' && user.vendor?.profile_status !== 'APPROVED') {
      res.status(403);
      throw new Error(
        `Account ${
          user.vendor?.profile_status || 'PENDING'
        }. Please contact admin for approval.`
      );
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(
        user._id,
        user.role === 'SUPER ADMIN' ? true : false
      ),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

// @desc    Forget Password
// @route   POST /api/users/
// @access  Public
const forgetUser = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      sendEmail({
        to: user.email,
        subject: `You have requested for password reset`,
        html: FORGET_PASSWORD_TEMPLATE({
          user: user,
          token: generateToken(user._id),
        }),
      });
      res.json({
        message:
          'Password reset email has been successfully sent to your email. Please check',
      });
    } else {
      res.status(404);
      throw new Error('Email Not found');
    }
  } catch (error) {
    console.log(error);
    res.status(404);
    throw new Error('Email Not found');
  }
});
const resetUser = asyncHandler(async (req, res) => {
  try {
    const { password, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded', decoded);
    const user = await User.findById(decoded.id).select('-password');

    if (user) {
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();

      res.json({
        message: 'Password reset successfully',
      });
    } else {
      res.status(404);
      throw new Error('Password Reset Request expired. Please try again later');
    }
  } catch (error) {
    console.log(error);
    res.status(404);
    throw new Error('Email Not found');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { name, phone, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    username: email,
    email,
    password,
    phone,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerVendor = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { name, phone, email, password, vendor } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists, Kindly contact to our customer service');
  }

  try {
    const user = await User.create({
      name,
      username: email,
      email,
      password,
      phone,
      vendor,
      role: 'VENDOR',
    });

    if (user) {
      // Send Email to the admin
      const adminEmail = process.env.ADMIN_EMAIL || 'support@autodeal4u.com';
      sendEmail({
        to: adminEmail,
        subject: `New Vendor Registration - ${name}`,
        html: `<h1>New Vendor Registration</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Store Name:</strong> ${vendor?.store_name || 'N/A'}</p>
        <p>A new vendor application has been submitted and is pending review.</p>
        `,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        vendor: user.vendor,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data - failed to create user object');
    }
  } catch (error) {
    console.error('Vendor Registration Error Detail:', error);
    res.status(400);
    throw new Error(error.message || 'Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.username = req.body.username || user.username;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  var data = req.body;
  const user = new User(data);
  let createdUser = await user.save();

  res.status(201).json(createdUser);
});

// @desc    Get user addresses
// @route   GET /api/users/:id/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Transform addresses to match frontend format
    const addresses = user.address.map((addr, index) => ({
      id: addr._id || index.toString(),
      type: addr.type || 'Home',
      name: user.name,
      phone: user.phone,
      address_1: addr.address_1,
      address_2: addr.address_2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pin,
      landmark: addr.landmark,
      isDefault: index === 0, // First address is default
    }));

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message,
    });
  }
});

// @desc    Add user address
// @route   POST /api/users/:id/addresses
// @access  Private
const addUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const newAddress = {
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city,
      state: req.body.state,
      pin: req.body.pincode,
      landmark: req.body.landmark,
    };

    user.address.push(newAddress);
    await user.save();

    // Return the new address in the format expected by frontend
    const addedAddress = {
      id: user.address[user.address.length - 1]._id,
      type: req.body.type || 'Home',
      name: req.body.name || user.name,
      phone: req.body.phone || user.phone,
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
      isDefault: req.body.isDefault || false,
    };

    res.json({
      success: true,
      message: 'Address added successfully',
      address: addedAddress,
    });
  } catch (error) {
    console.error('Error adding user address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message,
    });
  }
});

// @desc    Update user address
// @route   PUT /api/users/:id/addresses/:addressId
// @access  Private
const updateUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      res.status(404);
      throw new Error('Address not found');
    }

    // Update the address
    user.address[addressIndex] = {
      ...user.address[addressIndex],
      address_1: req.body.address_1 || user.address[addressIndex].address_1,
      address_2: req.body.address_2 || user.address[addressIndex].address_2,
      city: req.body.city || user.address[addressIndex].city,
      state: req.body.state || user.address[addressIndex].state,
      pin: req.body.pincode || user.address[addressIndex].pin,
      landmark: req.body.landmark || user.address[addressIndex].landmark,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
    });
  } catch (error) {
    console.error('Error updating user address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message,
    });
  }
});

// @desc    Delete user address
// @route   DELETE /api/users/:id/addresses/:addressId
// @access  Private
const deleteUserAddress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.address = user.address.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message,
    });
  }
});

export {
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
};
