import dotenv from 'dotenv';
import Razorpay from 'razorpay';

// Load .env from the current directory
dotenv.config();

console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? '***hidden***' : 'undefined');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Error: Razorpay credentials are not defined in the .env file!');
  process.exit(1);
}

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testCredentials() {
  try {
    const options = {
      amount: 100, // ₹1.00 (100 paise)
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`,
    };
    console.log('Attempting to create a test order in Razorpay...');
    const order = await instance.orders.create(options);
    console.log('✅ Success! Razorpay order created:', order.id);
  } catch (error) {
    console.error('❌ Razorpay Error:', error);
  }
}

testCredentials();
