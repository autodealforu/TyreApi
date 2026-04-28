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
// import shipRocketToken from "../../utils/shipping/shiprocketAuth.js";

// @desc    Fetch all orders
// @route   GET /api/orders
// @access  Public
const getOrders = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    console.log('req.user._id', req.user._id);
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['vendor'] = req.user._id;
    }
    if (req.user && req.user.role === 'CUSTOMER') {
      searchParams['customer.customer'] = req.user._id;
    }
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
    console.log('Search Params', searchParams);
    const count = await Order.countDocuments({ ...searchParams });
    const orders = await Order.find({ ...searchParams })
      .limit(pageSize)
      .populate('vendor')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    // sendEmail({
    //   to: "nishant.tripathi7700@gmail.com",
    //   subject: "Thank You for your Email.",
    //   html: EMAIL_TEMPLATE,
    // });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
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

// @desc    Fetch single order
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('order.products.product')
      .populate('vendor')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (order) {
      res.json(order);
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

// @desc    Delete a order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (order) {
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

const createOrder = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (data.products) {
      if (data.customer && data.customer.customer) {
      } else {
        const { name, phone, email } = data.customer;

        const userExists = await User.findOne({ email });
        if (userExists) {
          data.customer.customer = userExists._id;
        } else {
          const newPassword = Math.floor(Math.random() * 1000000 + 1);
          const user = await User.create({
            name,
            username: email,
            email,
            password: newPassword,
            phone,
          });
          sendEmail({
            to: user.email,
            subject: `Your Account has been created successfully`,
            html: NEW_USER_REGISTER_TEMPLATE({
              user: user,
              password: newPassword,
            }),
          });
          data.customer.customer = user._id;
        }
      }

      if (req.user) {
        data.created_by = req.user._id;
      }
      let newOrdersToCreate = [];
      const getOrdersToCreate = async () => {
        const promises = data.products.map(async (item) => {
          const ordersNew = await getOrdersDataToCreateFunction({
            product: item,
            order_data: data,
          });
          newOrdersToCreate.push(ordersNew);
        });
        await Promise.all(promises);
      };

      await getOrdersToCreate();
      // console.log('homepage to show', newOrdersToCreate);

      // const newOrders = data.products.map((item) => {
      //   return {
      //     status: data.status,
      //     is_paid: data.is_paid,
      //     payment_method: data.payment_method,
      //     total_amount: item.quantity * item.sale_price + item.tax,
      //     sub_total: item.quantity * item.sale_price,
      //     tax: item.tax,
      //     discount: 0,
      //     delivery_charges: 0,
      //     address: data.address,
      //     customer: data.customer,
      //     products: [item],
      //     vendor: item.vendor,
      //   };
      // });
      // const order = new Order(newOrders);
      // const createdOrder = await order.save();
      // if (
      //   createdOrder &&
      //   createdOrder.customer &&
      //   createdOrder.customer.email &&
      //   createdOrder.status == 'PROCESSING'
      // ) {
      //   sendEmail({
      //     to: createdOrder.customer.email,
      //     subject: `Your order #${createdOrder.order_id} has been placed successfully`,
      //     html: EMAIL_TEMPLATE({ order: createdOrder }),
      //   });
      //   // sendEmail({
      //   //   to: createdOrder.customer.email,
      //   //   subject: `Order #${createdOrder.order_id} has been placed successfully`,
      //   //   html: EMAIL_TEMPLATE({ order: createdOrder }),
      //   // });
      //   const notification = new Notification({
      //     notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
      //     order: createdOrder._id,
      //   });

      //   const createdNotification = await notification.save();
      //   const notification_vendor = new Notification({
      //     notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
      //     order: createdOrder._id,
      //     user: createOrder.vendor,
      //   });

      //   const createdNotificationVendor = await notification_vendor.save();
      //   const order_data = await Order.findById(createdOrder._id)
      //     .populate('products.product')
      //     .populate('created_by', '_id, name')
      //     .populate('updated_by', '_id, name');
      //   console.log(order_data);
      //   // const shiproket_response = await shipRocketToken({ order: order_data });
      //   // console.log("SHIP Rocket Res", shiproket_response);
      //   // order_data.shipping_details = shiproket_response;
      //   // order.shipping_details.current_status = shiproket_response.status;
      //   // const updatedOrder = await order_data.save();
      //   // res.status(201).json(updatedOrder);
      //   res.status(201).json(order_data);
      // }
      res.status(201).json('Order Created Successfully');
    }

    // res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Create a order
// @route   POST /api/orders
// @access  Private/Admin
const createOrderOld = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (data.products) {
      if (data.customer && data.customer.customer) {
      } else {
        const { name, phone, email } = data.customer;

        const userExists = await User.findOne({ email });
        if (userExists) {
          data.customer.customer = userExists._id;
        } else {
          const newPassword = Math.floor(Math.random() * 1000000 + 1);
          const user = await User.create({
            name,
            username: email,
            email,
            password: newPassword,
            phone,
          });
          sendEmail({
            to: user.email,
            subject: `Your Account has been created successfully`,
            html: NEW_USER_REGISTER_TEMPLATE({
              user: user,
              password: newPassword,
            }),
          });
          data.customer.customer = user._id;
        }
      }

      if (req.user) {
        data.created_by = req.user._id;
      }
      const order = new Order(data);
      const createdOrder = await order.save();
      if (
        createdOrder &&
        createdOrder.customer &&
        createdOrder.customer.email &&
        createdOrder.status == 'PROCESSING'
      ) {
        sendEmail({
          to: createdOrder.customer.email,
          subject: `Your order #${createdOrder.order_id} has been placed successfully`,
          html: EMAIL_TEMPLATE({ order: createdOrder }),
        });
        // sendEmail({
        //   to: createdOrder.customer.email,
        //   subject: `Order #${createdOrder.order_id} has been placed successfully`,
        //   html: EMAIL_TEMPLATE({ order: createdOrder }),
        // });
        const notification = new Notification({
          notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
          order: createdOrder._id,
        });

        const createdNotification = await notification.save();
        const notification_vendor = new Notification({
          notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
          order: createdOrder._id,
          user: createOrder.vendor,
        });

        const createdNotificationVendor = await notification_vendor.save();
        const order_data = await Order.findById(createdOrder._id)
          .populate('products.product')
          .populate('created_by', '_id, name')
          .populate('updated_by', '_id, name');
        console.log(order_data);
        // const shiproket_response = await shipRocketToken({ order: order_data });
        // console.log("SHIP Rocket Res", shiproket_response);
        // order_data.shipping_details = shiproket_response;
        // order.shipping_details.current_status = shiproket_response.status;
        // const updatedOrder = await order_data.save();
        // res.status(201).json(updatedOrder);
        res.status(201).json(order_data);
      }
    }

    // res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Order.findById(req.params.id);
    let statusIsChanged = false;

    if (data.status !== feed.status && data.status == 'PENDING') {
      statusIsChanged = true;
    }
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedOrder = await data.save();
      if (
        statusIsChanged &&
        updatedOrder.customer &&
        updatedOrder.customer.email
      ) {
        sendEmail({
          to: updatedOrder.customer.email,
          subject: `Your order #${updatedOrder.order_id} has been updated successfully`,
          html: ORDER_UPDATE_TEMPLATE({ order: updatedOrder }),
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Order.findById(req.params.id);
    let statusIsChanged = false;

    if (data.status !== feed.status && data.status == 'PENDING') {
      statusIsChanged = true;
    }
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedOrder = await data.save();
      if (
        statusIsChanged &&
        updatedOrder.customer &&
        updatedOrder.customer.email
      ) {
        sendEmail({
          to: updatedOrder.customer.email,
          subject: `Your order #${updatedOrder.order_id} has been updated successfully`,
          html: ORDER_UPDATE_TEMPLATE({ order: updatedOrder }),
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getOrders,
  getOrderById,
  deleteOrder,
  createOrder,
  updateOrder,
  getAllOrders,
  changeOrderStatus,
};
