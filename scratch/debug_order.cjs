const mongoose = require('mongoose');

async function checkOrder() {
  try {
    await mongoose.connect('mongodb://localhost:27017/multivendor');
    console.log('Connected to MongoDB');

    const orderSchema = new mongoose.Schema({}, { strict: false });
    const Order = mongoose.model('Order', orderSchema, 'orders');

    const order_id = 1016; 
    const order = await Order.findOne({ order_id: order_id });
    
    if (order) {
      console.log('Order found:', JSON.stringify(order, null, 2));
    } else {
      console.log('Order NOT found with order_id:', order_id);
      
      const lastOrder = await Order.findOne().sort({ createdAt: -1 });
      console.log('Last order in DB:', lastOrder ? lastOrder.order_id : 'None');
      console.log('Last order _id:', lastOrder ? lastOrder._id : 'None');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrder();
