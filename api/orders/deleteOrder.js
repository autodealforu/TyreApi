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

const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.remove();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

export { deleteOrder };
