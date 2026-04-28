import { SHIP_ROCKET_EMAIL, SHIP_ROCKET_PASSWORD } from "../constant.js";

// var axios = require("axios");
import axios from "axios";
import moment from "moment";
const shipRocketToken = async ({ order }) => {
  console.log("ORDER", order);
  if (order) {
    try {
      var data = JSON.stringify({
        email: SHIP_ROCKET_EMAIL,
        password: SHIP_ROCKET_PASSWORD,
      });

      var config = {
        method: "post",
        url: "https://apiv2.shiprocket.in/v1/external/auth/login",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(config);
      const token_data = response.data;
      if (token_data && token_data.token) {
        console.log("TOEKN", token_data);
        // Enter Data Here
        const order_items = order.products.map((item, index) => {
          return {
            name: item.name,
            sku: item.sku ? item.sku : `order-${order.order_id}-${index}`,
            units: item.quantity,
            selling_price: item.sale_price,
            discount: "",
            tax: item.tax ? item.tax : 0,
            hsn: "",
          };
        });

        var order_data = JSON.stringify({
          order_id: order.order_id,
          order_date:
            order.createdAt &&
            moment(order.createdAt).format("YYYY-MM-DD h:mm"),
          pickup_location: "1STFARMER",
          channel_id: "",
          comment: "",
          billing_customer_name: order.customer && order.customer.name,
          billing_last_name: "",
          billing_address: order.address && order.address.address_1,
          billing_address_2: order.address && order.address.address_2,
          billing_city: order.address && order.address.city,
          billing_pincode: order.address && order.address.pin,
          billing_state: order.address && order.address.state,
          billing_country: "India",
          billing_email: order.customer && order.customer.email,
          billing_phone: order.customer && order.customer.phone,
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
          order_items: order_items,
          payment_method: order.payment_method === "ONLINE" ? "Prepaid" : "COD",
          shipping_charges: 0,
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: order.discount,
          sub_total: order.sub_total,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
        });

        var config = {
          method: "post",
          url: "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token_data.token}`,
          },
          data: order_data,
        };
        try {
          const order_response = await axios(config);
          console.log(order_response.data);
          return order_response.data;
        } catch (error) {
          console.log(JSON.stringify(error));
        }
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
};

export default shipRocketToken;
