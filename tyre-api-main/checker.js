import { SHIPPING_TOKEN } from './services/shipping/tokenService.js';

const getToken = async () => {
  const token = await SHIPPING_TOKEN();

  console.log('Form Page', token);
};
getToken();
