import axios from 'axios';

export const SHIPPING_TOKEN = async () => {
  let formData = JSON.stringify({
    username: 'ela12673',
    key: 'snayUcxYQCyUFFFYasveRk4MDNgEj1JdTrsE67LhJwxRyzb5SsiUwvVddmogHgJI9XZpmfNpz6Dn4A4Dju32VESHmQ2hQfNsUA1W3OmMeOqa3gP6nUvQYofSSApyiMPKhTZCJ02aSh2TMCPUXg2mnUuBw1MHyEaHGcABRowzQ3x4ZE0mX3JXEwc7JjOnxFApNl3syvvmQkicsFb9JTVht0RaFnVYEWMhm8Rdx9xdbmzebUBsafW7DGaG8GS3fQ6L',
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://www.icarry.in/api_login',
    headers: {
      'Content-Type': 'application/json',
    },
    data: formData,
  };
  const { data } = await axios.request(config);
  return data;
};

export const SHIPPING_ZONES = [
  {
    zone_id: 1475,
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
  },
  {
    zone_id: 1476,
    name: 'Andhra Pradesh',
    code: 'AP',
  },
  {
    zone_id: 1477,
    name: 'Arunachal Pradesh',
    code: 'AR',
  },
  {
    zone_id: 1478,
    name: 'Assam',
    code: 'AS',
  },
  {
    zone_id: 1479,
    name: 'Bihar',
    code: 'BI',
  },
  {
    zone_id: 1480,
    name: 'Chandigarh',
    code: 'CH',
  },
  {
    zone_id: 1481,
    name: 'Dadra and Nagar Haveli',
    code: 'DA',
  },
  {
    zone_id: 1482,
    name: 'Daman and Diu',
    code: 'DM',
  },
  {
    zone_id: 1483,
    name: 'Delhi',
    code: 'DE',
  },
  {
    zone_id: 1484,
    name: 'Goa',
    code: 'GO',
  },
  {
    zone_id: 1485,
    name: 'Gujarat',
    code: 'GU',
  },
  {
    zone_id: 1486,
    name: 'Haryana',
    code: 'HA',
  },
  {
    zone_id: 1487,
    name: 'Himachal Pradesh',
    code: 'HP',
  },
  {
    zone_id: 1488,
    name: 'Jammu and Kashmir',
    code: 'JA',
  },
  {
    zone_id: 1489,
    name: 'Karnataka',
    code: 'KA',
  },
  {
    zone_id: 1490,
    name: 'Kerala',
    code: 'KE',
  },
  {
    zone_id: 1491,
    name: 'Lakshadweep Islands',
    code: 'LI',
  },
  {
    zone_id: 1492,
    name: 'Madhya Pradesh',
    code: 'MP',
  },
  {
    zone_id: 1493,
    name: 'Maharashtra',
    code: 'MA',
  },
  {
    zone_id: 1494,
    name: 'Manipur',
    code: 'MN',
  },
  {
    zone_id: 1495,
    name: 'Meghalaya',
    code: 'ME',
  },
  {
    zone_id: 1496,
    name: 'Mizoram',
    code: 'MI',
  },
  {
    zone_id: 1497,
    name: 'Nagaland',
    code: 'NA',
  },
  {
    zone_id: 1498,
    name: 'Odisha',
    code: 'OD',
  },
  {
    zone_id: 1499,
    name: 'Puducherry',
    code: 'PO',
  },
  {
    zone_id: 1500,
    name: 'Punjab',
    code: 'PU',
  },
  {
    zone_id: 1501,
    name: 'Rajasthan',
    code: 'RA',
  },
  {
    zone_id: 1502,
    name: 'Sikkim',
    code: 'SI',
  },
  {
    zone_id: 1503,
    name: 'Tamil Nadu',
    code: 'TN',
  },
  {
    zone_id: 1504,
    name: 'Tripura',
    code: 'TR',
  },
  {
    zone_id: 1505,
    name: 'Uttar Pradesh',
    code: 'UP',
  },
  {
    zone_id: 1506,
    name: 'West Bengal',
    code: 'WB',
  },
  {
    zone_id: 4231,
    name: 'Telangana',
    code: 'TS',
  },
  {
    zone_id: 4239,
    name: 'Jharkhand',
    code: 'JH',
  },
  {
    zone_id: 4240,
    name: 'Uttarakhand',
    code: 'UK',
  },
  {
    zone_id: 4241,
    name: 'Chattisgarh',
    code: 'CG',
  },
  {
    zone_id: 4242,
    name: 'Ladakh',
    code: 'LA',
  },
];

export const COUNTRY_ID = '99';

export const ADD_PICKUP_ADDRESS = async ({
  TOKEN,
  nickname,
  name,
  email,
  phone,
  address_1,
  address_2,
  city,
  state,
  pincode,
}) => {
  const zone_id = SHIPPING_ZONES.filter((zone) => zone.name == state);
  if (zone_id && zone_id.length > 0) {
    const dataToShare = {
      nickname: nickname,
      name: name,
      email: email,
      phone: phone,
      alt_phone: '',
      street1: address_1,
      street2: address_2,
      city: city,
      pincode: pincode,
      zone_id: zone_id[0].zone_id,
      country_id: '99',
    };
    const dataTOSend = JSON.stringify(dataToShare);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://www.icarry.in/api_add_pickup_address&api_token=${TOKEN}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: dataTOSend,
    };
    const { data } = await axios.request(config);
    return data;
  } else {
    return null;
  }
};

export const CHECK_SERVICEABILITY = async ({ TOKEN, pincode }) => {
  const dataToShare = {
    pincode: pincode,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_check_pincode&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};

export const PRINT_SHIPMENT_LABEL = async ({ TOKEN, shipment_id }) => {
  const dataToShare = {
    shipment_id: shipment_id,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_print_shipment_label&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};

export const BOOK_SHIPMENT = async ({
  TOKEN,
  pickup_address_id,
  name,
  mobile,
  email,
  address,
  city,
  pincode,
  state,
  payment_method,
  total_amount,
  product_name,
  weight,
  length,
  breadth,
  height,
  courier_id,
}) => {
  const state_code = SHIPPING_ZONES.filter((zone) => zone.name == state);
  const dataToShare = {
    pickup_address_id: pickup_address_id,
    consignee: {
      name: name,
      mobile: mobile,
      email: email,
      address: address,
      city: city,
      pincode: pincode,
      state:
        state_code && state_code.length > 0 && state_code[0].code
          ? state_code[0].code
          : 'DL',
      country_code: 'IN',
    },
    parcel: {
      type: payment_method,
      value: total_amount,
      currency: 'INR',
      contents: product_name,
      weight: {
        weight: weight,
        unit: 'gm',
      },
      dimensions: {
        length: length,
        breadth: breadth,
        height: height,
        unit: 'cm',
      },
      courier_id,
    },
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_add_shipment_surface&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};

export const GET_ESTIMATE_COURIER = async ({
  TOKEN,
  length,
  breadth,
  height,
  weight,
  destination_pincode,
  origin_pincode,
  shipment_type,
  shipment_value,
}) => {
  const dataToShare = {
    length: length,
    breadth: breadth,
    height: height,
    weight: weight,
    destination_pincode: destination_pincode,
    origin_pincode: origin_pincode,
    destination_country_code: 'IN',
    origin_country_code: 'IN',
    shipment_mode: 'S',
    shipment_type: shipment_type,
    shipment_value: shipment_value,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_get_estimate&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};

export const CANCEL_SHIPMENT = async ({ TOKEN, shipment_id }) => {
  const dataToShare = {
    shipment_id: shipment_id,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_cancel_shipment&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};

export const REVERSE_SHIPMENT = async ({ TOKEN, shipment_id }) => {
  const dataToShare = {
    shipment_id: shipment_id,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_add_reverse_shipment&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};
export const TRACK_SHIPMENT = async ({ TOKEN, shipment_id }) => {
  const dataToShare = {
    shipment_id: shipment_id,
  };
  const dataTOSend = JSON.stringify(dataToShare);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://www.icarry.in/api_track_shipment&api_token=${TOKEN}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataTOSend,
  };
  const { data } = await axios.request(config);
  return data;
};
