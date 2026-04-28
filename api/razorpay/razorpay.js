import Razorpay from 'razorpay';

var instance = new Razorpay({
  key_id: 'rzp_live_Jb8obvKfR04xtT',
  key_secret: '63VtAgD1R5NhNjaAh3rvRhTw',
});

var options = {
  amount: 50000, // amount in the smallest currency unit
  currency: 'INR',
  receipt: 'order_rcptid_11',
};
instance.orders.create(options, function (err, order) {
  console.log(order);
});
