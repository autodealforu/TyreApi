// Login with OTP
import asyncHandler from 'express-async-handler';
import generateToken from '../../utils/generateToken.js';
import User from './UserModel.js';
import jwt from 'jsonwebtoken';
import request from 'request';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

// Generate OTP and send to user phone number

const generateOTP = asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Log OTP for easy local testing
    console.log(`[TESTING] Generated OTP for ${phone}: ${otp}`);

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    try {
      await twilioClient.messages.create({
        body: `Your Autodeal4U verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`Twilio OTP sent successfully to ${formattedPhone}`);
    } catch (smsError) {
      console.error('Twilio SMS Delivery failed, but OTP generated for console logs:', smsError);
    }

    const token = jwt.sign({ otp, phone }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    res.json({
      token,
    });
  } catch (error) {
    console.error('generateOTP Error:', error);
    throw new Error('Not working please try again after some time');
  }
});

// OTP Verification
const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { otp, token, verifyOnly } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded', decoded);
    if (decoded) {
      if (otp === decoded.otp) {
        if (verifyOnly) {
          return res.json({
            success: true,
            message: 'OTP verified successfully'
          });
        }
        const user = await User.findOne({ username: decoded.phone });
        if (!user) {
          let password = Math.floor(
            10000000 + Math.random() * 90000000
          ).toString();
          const userDetails = new User({
            name: 'User',
            phone: decoded.phone,
            username: decoded.phone,
            password: password,
          });
          const createdUser = await userDetails.save();
          res.json({
            token: generateToken(createdUser._id),
            user: createdUser,
          });
        } else {
          res.json({
            token: generateToken(user._id),
            user: user,
          });
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    throw new Error('Not working please try again after some time');
  }
});

export { generateOTP, verifyOTP };
