import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import Notification from '../notifications/NotificationModel.js';
import checkRequired from '../../utils/checkRequired.js';
import sendEmail from '../../utils/mail.js';
import { EMAIL_TEMPLATE } from '../../utils/template/Template.js';
import { ORDER_UPDATE_TEMPLATE } from '../../utils/template/OrderStatusTemplate.js';
import User from '../users/UserModel.js';
import { NEW_USER_REGISTER_TEMPLATE } from '../../utils/template/NewRegisteredUser.js';
import { getOrdersDataToCreateFunction } from './orderService.js';
// @desc    Fetch all orders
// @route   GET /api/orders/all
// @access  Public
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const orders = await Order.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

export { getAllOrders };
