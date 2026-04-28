// Login with OTP
import asyncHandler from 'express-async-handler';
import generateToken from '../../utils/generateToken.js';
import User from './UserModel.js';
import jwt from 'jsonwebtoken';
import request from 'request';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

// Generate OTP and send to user phone number

const generateOTP = asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    var options = {
      method: 'POST',
      url: 'https://api.textlocal.in/send/',
      formData: {
        apiKey: 'Nzg3OTc3NGU2MzYyNjM3MjM2NTE0ZjYzNmIzMzZkMzM=',
        numbers: `91${phone}`,
        sender: 'RAROTP',
        message: `Dear%20User%2C%20Your%20OTP%20is%20${otp}.%20Please%20enter%20the%20same%20to%20continue%20with%20your%20mobile%20verification%20process.%20-%20Regards%2C%20Rareview%20Fashion.`,
      },
    };
    request(options, function (error, response) {
      if (error)
        throw new Error('Something went wrong please try again after sometime');
      console.log(response.body);
      const token = jwt.sign({ otp, phone }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      res.json({
        token,
      });
    });
  } catch (error) {
    throw new Error('Not working please try again after some time');
  }
});

// OTP Verification
const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { otp, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded', decoded);
    if (decoded) {
      if (otp === decoded.otp) {
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
