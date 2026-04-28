import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import Razorpay from 'razorpay';

import morgan from 'morgan';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import upload from './config/uploads.js';
import cors from 'cors';
import userRoutes from './api/users/userRoutes.js';
import newsletterRoutes from './api/newsletters/newsletterRoutes.js';
import contactRoutes from './api/contacts/contactRoutes.js';
import bannerRoutes from './api/banners/bannerRoutes.js';
import pageRoutes from './api/pages/pageRoutes.js';
import categoryRoutes from './api/categorys/categoryRoutes.js';
import blogRoutes from './api/blogs/blogRoutes.js';
import couponRoutes from './api/coupons/couponRoutes.js';
import customerRoutes from './api/customers/customerRoutes.js';
import returnrequestRoutes from './api/returnrequests/returnrequestRoutes.js';
import collectionRoutes from './api/collections/collectionRoutes.js';
import orderRoutes from './api/orders/orderRoutes.js';
import productRoutes from './api/products/productRoutes.js';
import notificationRoutes from './api/notifications/notificationRoutes.js';
import dashboardRoutes from './api/dashoard/dashboardRoutes.js';
import mobilebannerRoutes from './api/mobilebanners/mobilebannerRoutes.js';
import reviewRoutes from './api/reviews/reviewRoutes.js';
import menuRoutes from './api/menus/menuRoutes.js';
import sizeRoutes from './api/sizes/sizeRoutes.js';
import colorRoutes from './api/colors/colorRoutes.js';
import testimonialRoutes from './api/testimonials/testimonialRoutes.js';
import vendorRoutes from './api/vendors/vendorRoutes.js';
import homepageRoutes from './api/homepages/homepageRoutes.js';
import templateRoutes from './api/templates/templateRoutes.js';
import productcategoryRoutes from './api/productcategorys/productcategoryRoutes.js';
// import shiprocketRoutes from "./api/shiprockets/shiprocketRoutes.js";
// import shipRocketToken from "./utils/shipping/shiprocketAuth.js";
import webhookRoutes from './api/webhoook/webhookRoutes.js';
import subcategoryRoutes from './api/subcategorys/subcategoryRoutes.js';
import subsubcategoryRoutes from './api/subsubcategorys/subsubcategoryRoutes.js';
import subsubsubcategoryRoutes from './api/subsubsubcategorys/subsubsubcategoryRoutes.js';
import subsubsubsubcategoryRoutes from './api/subsubsubsubcategorys/subsubsubsubcategoryRoutes.js';
import brandRoutes from './api/brands/brandRoutes.js';
import franchiseRoutes from './api/franchises/franchiseRoutes.js';
import Bulk from './api/bulks/BulkRoutes.js';
import googleRoutes from './api/googlemarchant/googleMarchantRoutes.js';

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/categorys', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/returnrequests', returnrequestRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/mobilebanners', mobilebannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/homepages', homepageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/productcategorys', productcategoryRoutes);
app.use('/api/subcategorys', subcategoryRoutes);
app.use('/api/subsubcategorys', subsubcategoryRoutes);
app.use('/api/subsubsubcategorys', subsubsubcategoryRoutes);
app.use('/api/subsubsubsubcategorys', subsubsubsubcategoryRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/bulks', Bulk);
app.use('/api/subsubsubsubcategorys', subsubsubsubcategoryRoutes);
app.use('/api/franchises', franchiseRoutes);
// app.use("/api/ship", shiprocketRoutes);
app.use('/test-ship', webhookRoutes);
app.use('/api/googlefeed', googleRoutes);

app.use('/api/upload', upload);

app.get('/api/razorpay', (req, res) => {
  var instance = new Razorpay({
    key_id: 'rzp_live_Jb8obvKfR04xtT',
    key_secret: '63VtAgD1R5NhNjaAh3rvRhTw',
  });

  var options = {
    amount: req.query.amount * 100, // amount in the smallest currency unit
    currency: 'INR',
    receipt: 'order_rcptid_11',
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.json(order);
  });
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/admin/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'admin', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
