import path from 'path';
import { fileURLToPath } from 'url';
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
import websiteProductRoutes from './api/products/websiteProductRoutes.js';
import mobileAppProductRoutes from './api/products/mobileAppProductRouter.js';
import unifiedProductRoutes from './api/products/unifiedProductRoutes.js';
import notificationRoutes from './api/notifications/notificationRoutes.js';
import dashboardRoutes from './api/dashoard/dashboardRoutes.js';
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
import Bulk from './api/bulks/BulkRoutes.js';
import googleRoutes from './api/googlemarchant/googleMarchantRoutes.js';
import PartRoutes from './api/parts/partsRoutes.js';
import TechnicianRoutes from './api/technicians/technicianRoutes.js';
import VehicleRoutes from './api/vehicles/vehicleRoutes.js';
import JobCardRoutes from './api/jobcards/jobCardRoutes.js';
import ServiceRoutes from './api/services/serviceRoutes.js';
import TyreRoutes from './api/tyres/tyreRoutes.js';
import AlloyWheelRoutes from './api/alloy-wheels/alloyWheelRoutes.js';
import AlloyDiameterRoutes from './api/alloy-wheels/AlloyDiameterRoutes.js';
import AlloyPCDRoutes from './api/alloy-wheels/AlloyPCDRoutes.js';
import AlloyOffsetRoutes from './api/alloy-wheels/AlloyOffsetRoutes.js';
import AlloyBoreRoutes from './api/alloy-wheels/AlloyBoreRoutes.js';
import AlloyFinishRoutes from './api/alloy-wheels/AlloyFinishRoutes.js';
import RimDiameterRoutes from './api/rim-diameters/rimDiameterRoutes.js';
import AlloyWidthRoutes from './api/alloy-wheels/AlloyWidthRoutes.js';
import TyreWidthRoutes from './api/tyre-widths/tyreWidthRoutes.js';
import AspectRatioRoutes from './api/aspect-ratios/aspectRatioRoutes.js';
import LoadIndexRoutes from './api/load-indexes/loadIndexRoutes.js';
import SpeedSymbolRoutes from './api/speed-symbols/speedSymbolRoutes.js';
import PlyRatingRoutes from './api/plyratings/plyRatingRoutes.js';
import ThreadPattern from './api/thread-patterns/threadPatternRoutes.js';
import ProductTypeRoutes from './api/product-types/productTypeRoutes.js';
import MakeModelRoutes from './api/makeandmodels/makeModelRoutes.js';

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors({
  origin: [
    "https://main.d2rx1qldm8fkz9.amplifyapp.com", // Admin Panel (old)
    "https://main.d17qz4fp1tum7m.amplifyapp.com", // Frontend (old)
    "https://autodeal4u.in",                      // Frontend
    "https://www.autodeal4u.in",                  // Frontend (www)
    "https://admin.autodeal4u.in",                // Admin Panel (new)
    "http://localhost:3000"                       // Local testing
  ],
  credentials: true
}));

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
app.use('/api/products/unified', unifiedProductRoutes);
app.use('/api/products', productRoutes);
app.use('/api/website-products', websiteProductRoutes);
app.use('/api/app-products', mobileAppProductRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/returnrequests', returnrequestRoutes);
app.use('/api/dashboards', dashboardRoutes);
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
app.use('/api/parts', PartRoutes);
app.use('/api/technicians', TechnicianRoutes);
app.use('/api/vehicles', VehicleRoutes);
app.use('/api/services', ServiceRoutes);
app.use('/api/job-cards', JobCardRoutes);
app.use('/api/tyres', TyreRoutes);
app.use('/api/alloy-wheels', AlloyWheelRoutes);
app.use('/api/alloy-diameters', AlloyDiameterRoutes);
app.use('/api/alloy-widths', AlloyWidthRoutes);
app.use('/api/alloy-pcds', AlloyPCDRoutes);
app.use('/api/alloy-offsets', AlloyOffsetRoutes);
app.use('/api/alloy-bores', AlloyBoreRoutes);
app.use('/api/alloy-finishes', AlloyFinishRoutes);
app.use('/api/rim-diameters', RimDiameterRoutes);
app.use('/api/tyre-widths', TyreWidthRoutes);
app.use('/api/aspect-ratios', AspectRatioRoutes);
app.use('/api/load-indexes', LoadIndexRoutes);
app.use('/api/speed-symbols', SpeedSymbolRoutes);
app.use('/api/ply-ratings', PlyRatingRoutes);
app.use('/api/thread-patterns', ThreadPattern);
app.use('/api/product-types', ProductTypeRoutes);
app.use('/api/makemodels', MakeModelRoutes);

app.use('/api/subsubsubsubcategorys', subsubsubsubcategoryRoutes);
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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Then update your static route to use a simple string for the folder:
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

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

//changes123467890
