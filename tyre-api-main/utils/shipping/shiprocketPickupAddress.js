import { SHIP_ROCKET_EMAIL, SHIP_ROCKET_PASSWORD } from '../constant.js';

// var axios = require("axios");
import axios from 'axios';
import moment from 'moment';
const shipRocketAddPickupAddress = async ({ vendor, user, vendor_id }) => {
  // console.log('ORDER', order);
  if (vendor) {
    try {
      var data = JSON.stringify({
        email: SHIP_ROCKET_EMAIL,
        password: SHIP_ROCKET_PASSWORD,
      });

      var config = {
        method: 'post',
        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      const response = await axios(config);
      const token_data = response.data;
      if (token_data && token_data.token) {
        console.log('TOEKN', token_data);
        // Enter Data Here

        var order_data = JSON.stringify({
          pickup_location: 'VENDOR' + vendor_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].address_1,
          address_2:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].address_2,
          city:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].city,
          state:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].state,
          country: 'India',
          pin_code:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].pin,
          address_type: 'vendor',
          vendor_name: vendor.store_name,
        });

        var Newdata = JSON.stringify({
          pickup_location: 'VENDOR' + user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].address_1,
          address_2:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].address_2,
          city:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].city,
          state:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].state,
          country: 'India',
          pin_code:
            vendor.pickup_address &&
            vendor.pickup_address[0] &&
            vendor.pickup_address[0].pin,
          address_type: 'vendor',
          vendor_name: vendor.store_name,
        });
        console.log('Order Data', Newdata);
        // var config = {
        //   method: 'post',
        //   url: 'https://apiv2.shiprocket.in/v1/external/settings/company/addpickup',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${token_data.token}`,
        //   },
        //   data: Newdata,
        // };

        var data = JSON.stringify({
          pickup_location: 'VENDOR' + user.user_id,
          name: 'Test',
          email: 'goldenhillslawn@gmail.com',
          phone: '8282828282',
          address: 'Flat no 4 Sector 3',
          address_2: 'Kidwai Nagar',
          city: 'Noida',
          state: 'Uttar Pradesh',
          country: 'India',
          pin_code: '201301',
          address_type: 'vendor',
          vendor_name: 'Deepak Store',
        });

        var config = {
          method: 'post',
          url: 'https://apiv2.shiprocket.in/v1/external/settings/company/addpickup',
          headers: {
            Authorization:
              'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjM3MDA4ODYsImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjg4NDMwMTcyLCJleHAiOjE2ODkyOTQxNzIsIm5iZiI6MTY4ODQzMDE3MiwianRpIjoiSFFKMERYVDJyRVFxNUR4diJ9.dKxvS75dkHN8QR7Z87KwBxTNK9jRfjUYNx2qLFAFyVU',
            'Content-Type': 'application/json',
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });

        // try {
        //   const order_response = await axios(config);
        //   console.log(order_response.data);
        //   return order_response.data;
        // } catch (error) {
        //   console.log(JSON.stringify(error));
        // }
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
};

export default shipRocketAddPickupAddress;
