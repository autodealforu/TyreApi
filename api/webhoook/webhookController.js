import asyncHandler from "express-async-handler";
import sendEmail from "../../utils/mail.js";
import { ORDER_OUT_FOR_DELIVERY_TEMPLATE } from "../../utils/template/OrderOutForDelivery.js";
import { ORDER_RECEIVED_TEMPLATE } from "../../utils/template/OrderReceived.js";
import Order from "../orders/OrderModel.js";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const webookSetup = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    res.send("RECEIVED");
    const dataShip = {
      awb: req.body.awb,
      current_status: req.body.current_status,
      // current_status_id: 7,
      shipment_status: req.body.shipment_status,
      shipment_status_id: req.body.shipment_status_id,
      current_timestamp: req.body.current_timestamp,
      order_id: req.body.order_id,
      channel_order_id: req.body.channel_order_id,
      channel: req.body.channel,
      courier_name: req.body.courier_name,
      etd: req.body.etd,
      scans: req.body.scans,
      is_return: req.body.is_return,
    };

    const order = await Order.findOne({
      shipping_details: { order_id: req.body.order_id },
    });
    if (order) {
      if (
        req.body.current_status === "Delivered" &&
        order.status !== "DELIVERED"
      ) {
        order.status = "DELIVERED";
        sendEmail({
          to: order.customer.email,
          subject: `Your order #${order.order_id} has been placed successfully`,
          html: ORDER_RECEIVED_TEMPLATE({ order: createdOrder }),
        });
      }
      if (
        req.body.current_status === "Out for Delivery" &&
        order.status !== "OUT FOR DELIVERY"
      ) {
        order.status = "OUT FOR DELIVERY";
        sendEmail({
          to: order.customer.email,
          subject: `Your order #${order.order_id} is out for delivery`,
          html: ORDER_OUT_FOR_DELIVERY_TEMPLATE({ order: createdOrder }),
        });
      }
      order.shipment_status = dataShip;
      const savedOrder = await order.save();
      res.json(savedOrder);
    }
  } catch (error) {
    console.log(error);
  }
});

export { webookSetup };
