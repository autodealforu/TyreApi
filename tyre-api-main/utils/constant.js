import dotenv from 'dotenv';
dotenv.config();
export const URI_SITE = process.env.URI_SITE;
export const LOGO = process.env.LOGO;
export const ADDRESS = process.env.ADDRESS;
export const SERVER_URL = process.env.SERVER_URL;
// Ship Rocket
export const SHIP_ROCKET_ENABLED = process.env.SHIP_ROCKET_ENABLED;
export const SHIP_ROCKET_EMAIL = process.env.SHIP_ROCKET_EMAIL;
export const SHIP_ROCKET_PASSWORD = process.env.SHIP_ROCKET_PASSWORD;

// Email Details

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_SSL = process.env.EMAIL_SSL;
export const EMAIL_AUTH_USER = process.env.EMAIL_AUTH_USER;
export const EMAIL_AUTH_PASSWORD = 'Pickkro$$#21';
export const EMAIL_AUTH_FROM = process.env.EMAIL_AUTH_FROM;
// Admin Details

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const ORDER_STATUS = [
  'PENDING',
  'PROCESSING',
  'ACCEPTED',
  'READY TO DISPATCH',
  'PICKED UP',
  'IN TRANSIT',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'RTO',
  'RETURN REQUEST',
  'RETURN CANCELLED',
  'RETURN ACCEPTED',
  'RETURN COMPLETED',
  'INCORRECT',
  'REFUNDED',
  'CANCELLED',
  'FAILED',
  'RETURNED',
];

export const ORDER_STATUS_ENUM = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  ACCEPTED: 'ACCEPTED',
  READY_TO_DISPATCH: 'READY TO DISPATCH',
  PICKED_UP: 'PICKED UP',
  IN_TRANSIT: 'IN TRANSIT',
  OUT_FOR_DELIVERY: 'OUT FOR DELIVERY',
  DELIVERED: 'DELIVERED',
  RTO: 'RTO',
  RETURN_REQUEST: 'RETURN REQUEST',
  RETURN_CANCELLED: 'RETURN CANCELLED',
  RETURN_ACCEPTED: 'RETURN ACCEPTED',
  RETURN_COMPLETED: 'RETURN COMPLETED',
  INCORRECT: 'INCORRECT',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
};

export const PAYMENT_METHOD = ['ONLINE', 'COD'];
