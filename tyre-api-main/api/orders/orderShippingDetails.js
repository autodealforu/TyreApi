import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';
import {
  ADD_PICKUP_ADDRESS,
  BOOK_SHIPMENT,
  GET_ESTIMATE_COURIER,
  SHIPPING_TOKEN,
  TRACK_SHIPMENT,
} from '../../services/shipping/tokenService.js';
import User from '../users/UserModel.js';

const checkEstimate = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vendor');
    console.log('Order', order, order.vendor.vendor);
    if (
      order &&
      order.courier_details &&
      order.courier_details.length &&
      order.vendor &&
      order.vendor.vendor &&
      order.vendor.vendor.pickup_address &&
      order.vendor.vendor.pickup_address[0] &&
      order.vendor.vendor.pickup_address[0].pin
    ) {
      // Get TOken First
      const get_token = await SHIPPING_TOKEN();
      console.log('Token', get_token);
      if (get_token && get_token.api_token) {
        const TOKEN = get_token.api_token;
        const get_estimate = await GET_ESTIMATE_COURIER({
          TOKEN,
          length: order.courier_details.length,
          breadth: order.courier_details.breadth,
          height: order.courier_details.height,
          weight: order.courier_details.weight,
          destination_pincode: order.address.pin,
          origin_pincode: order.vendor.vendor.pickup_address[0].pin,
          shipment_type: order.payment_method === 'ONLINE' ? 'P' : 'C',
          shipment_value: order.total_amount,
        });

        res.status(200).send(get_estimate);
      }
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

const createOrderPickup = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('vendor');
    console.log('Order', order, order.vendor.vendor);
    if (
      order &&
      order.courier_details &&
      order.courier_details.length &&
      order.vendor &&
      order.vendor.vendor &&
      order.vendor.vendor.pickup_address &&
      order.vendor.vendor.pickup_address[0] &&
      order.vendor.vendor.pickup_address[0].pin
    ) {
      // Get TOken First
      const get_token = await SHIPPING_TOKEN();
      console.log('Token', get_token);
      if (get_token && get_token.api_token) {
        const TOKEN = get_token.api_token;
        let pickup_address_id;
        // Add Pickup address if not available
        if (order.vendor.vendor.pickup_address[0].pickup_address_id) {
          pickup_address_id =
            order.vendor.vendor.pickup_address[0].pickup_address_id;
        } else {
          const vendor = order.vendor;
          const pickup_address = order.vendor.vendor.pickup_address[0];
          const orderPickupAddress = await ADD_PICKUP_ADDRESS({
            TOKEN,
            nickname: vendor.name,
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            address_1: pickup_address.address_1,
            address_2: pickup_address.address_2,
            city: pickup_address.city,
            state: pickup_address.state,
            pincode: pickup_address.pin,
          });
          console.log('orderPickupAddress', orderPickupAddress);
          const user_details = await User.findById(vendor._id);
          if (user_details) {
            const newVendor = user_details.vendor;
            let newPickUpAddress = newVendor.pickup_address.map((item) => {
              item.pickup_address_id = orderPickupAddress.warehouse_id;
              return item;
            });
            user_details.set({
              vendor: {
                pickup_address: newPickUpAddress,
              },
            });
            await user_details.save();
            pickup_address_id = orderPickupAddress.warehouse_id;
          }
        }
        // Add order to shipping
        const get_order = await BOOK_SHIPMENT({
          TOKEN,
          pickup_address_id,
          name: order.customer.name,
          mobile: order.customer.phone,
          email: order.customer.email,
          address: `${order.address.address_1} ${order.address.address_2}`,
          city: order.address.city,
          pincode: order.address.pin,
          state: order.address.state,
          payment_method: order.payment_method === 'ONLINE' ? 'P' : 'C',
          total_amount: order.total_amount,
          product_name:
            order.products && order.products[0] && order.products[0].name,
          weight: order,
          length: order.courier_details.length,
          breadth: order.courier_details.breadth,
          height: order.courier_details.height,
          weight: order.courier_details.weight,
          courier_id: req.body.courier_id,
        });
        console.log('get_order', get_order);
        if (get_order && get_order.shipment_id) {
          order.set({
            courier_details: {
              shipment_id: get_order.shipment_id,
            },
          });
          await order.save();
          res.status(200).send(order);
        }
      }
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

const getOrderTracking = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log('Order', order, order.vendor.vendor);
    if (order && order.courier_details && order.courier_details.shipment_id) {
      const get_token = await SHIPPING_TOKEN();
      console.log('Token', get_token);
      if (get_token && get_token.api_token) {
        const TOKEN = get_token.api_token;
        const tack_order = await TRACK_SHIPMENT({
          TOKEN,
          shipment_id: order.courier_details.shipment_id,
        });
        res.status(200).send(tack_order);
      } else {
        res.status(404);
        throw new Error('Order not found');
      }
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

export { checkEstimate, createOrderPickup, getOrderTracking };
