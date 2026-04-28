import asyncHandler from "express-async-handler";
import Shiprocket from "./ShiprocketModel.js";
import checkRequired from "../../utils/checkRequired.js";
import shipRocketToken from "../../utils/shipping/shiprocketAuth.js";
import axios from "axios";

// @desc    Fetch all shiprockets
// @route   GET /api/shiprockets
// @access  Public
const getShiprockets = asyncHandler(async (req, res) => {
  try {
    const token_data = await shipRocketToken();
    if (token_data && token_data.token) {
      console.log("TOEKN", token_data);
      // Enter Data Here

      var data = JSON.stringify({
        order_id: "224-449",
        order_date: "2022-12-24 11:11",
        pickup_location: "1STFARMER",
        channel_id: "",
        comment: "Reseller: M/s Goku",
        billing_customer_name: "Naruto",
        billing_last_name: "Uzumaki",
        billing_address: "House 221B, Leaf Village",
        billing_address_2: "Near Hokage House",
        billing_city: "New Delhi",
        billing_pincode: "110002",
        billing_state: "Delhi",
        billing_country: "India",
        billing_email: "naruto@uzumaki.com",
        billing_phone: "9876543210",
        shipping_is_billing: true,
        shipping_customer_name: "",
        shipping_last_name: "",
        shipping_address: "",
        shipping_address_2: "",
        shipping_city: "",
        shipping_pincode: "",
        shipping_country: "",
        shipping_state: "",
        shipping_email: "",
        shipping_phone: "",
        order_items: [
          {
            name: "Kunai",
            sku: "chakra123",
            units: 10,
            selling_price: "900",
            discount: "",
            tax: "",
            hsn: 441122,
          },
        ],
        payment_method: "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: 9000,
        length: 10,
        breadth: 15,
        height: 20,
        weight: 2.5,
      });

      var config = {
        method: "post",
        url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token_data.token}`,
        },
        data: data,
      };
      try {
        const order_response = await axios(config);
        console.log(order_response.data);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});
// @desc    Fetch all shiprockets
// @route   GET /api/shiprockets/all
// @access  Public
const getAllShiprockets = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams["published_status"] = "PUBLISHED";
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: "i",
      };
    }
    const shiprockets = await Shiprocket.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(shiprockets);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Fetch single shiprocket
// @route   GET /api/shiprockets/:id
// @access  Public
const getShiprocketById = asyncHandler(async (req, res) => {
  try {
    const shiprocket = await Shiprocket.findById(req.params.id)
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name");

    if (shiprocket && shiprocket.published_status === "PUBLISHED") {
      res.json(shiprocket);
    } else {
      res.status(404);
      throw new Error("Shiprocket not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Delete a shiprocket
// @route   DELETE /api/shiprockets/:id
// @access  Private/Admin
const deleteShiprocket = asyncHandler(async (req, res) => {
  try {
    const shiprocket = await Shiprocket.findById(req.params.id);

    if (shiprocket) {
      await shiprocket.remove();
      res.json({ message: "Shiprocket removed" });
    } else {
      res.status(404);
      throw new Error("Shiprocket not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Create a shiprocket
// @route   POST /api/shiprockets
// @access  Private/Admin
const createShiprocket = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const shiprocket = new Shiprocket(data);
    const createdShiprocket = await shiprocket.save();
    res.status(201).json(createdShiprocket);
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }
});

// @desc    Update a shiprocket
// @route   PUT /api/shiprockets/:id
// @access  Private
const updateShiprocket = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Shiprocket.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedShiprocket = await data.save();
      res.json(updatedShiprocket);
    } else {
      res.status(404);
      throw new Error("Shiprocket not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong.");
  }
});

export {
  getShiprockets,
  getShiprocketById,
  deleteShiprocket,
  createShiprocket,
  updateShiprocket,
  getAllShiprockets,
};
