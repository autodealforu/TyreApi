import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

// 1. Wrap your order creation logic into a dynamic POST endpoint
router.post('/create-order', async (req, res) => {
  try {
    // Initialize Razorpay dynamically (lazy loading) to ensure env variables are loaded
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    // Grab the actual total price sent from your Next.js storefront cart
    const { amount } = req.body; 

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Dynamically converts ₹ Rupees to Paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`, // Generates a unique receipt ID per order
    };

    // Create the order asynchronously
    const order = await instance.orders.create(options);
    
    // Return the official Razorpay Order object back to the Next.js frontend
    return res.status(200).json({
      success: true,
      order
    });

  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Something went wrong while initiating the payment.' 
    });
  }
});

export default router;