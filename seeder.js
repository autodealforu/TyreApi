import mongoose from 'mongoose';
import dotenv from 'dotenv';

// import Color from './api/colors/ColorModel.js';
import LoadIndex from './api/load-indexes/loadIndexModel.js';
import SpeedSymbol from './api/speed-symbols/speedSymbolModel.js';
import PlyRating from './api/plyratings/plyRatingModel.js';
import Brand from './api/brands/BrandModel.js';
import ThreadPattern from './api/thread-patterns/threadPatternModel.js';
import ProductType from './api/product-types/productTypeModel.js';

import connectDB from './config/db.js';
import TyreWidth from './api/tyre-widths/tyreWidthModel.js';
import User from './api/users/UserModel.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // await Client.deleteMany();
    // await Product.deleteMany()
    // await User.deleteMany()
    const users= [
      {
        name: 'Admin User',
        email: 'superadmin@superadmin.com',
        password: '123456',
        phone: '$2a$10$1W8XJZQy57SxUX/GrZzdXuZfhHJjSFh4k9PjcfOT1XflPItfZdVyG',
        username: 'superadmin',
        published_status:"PUBLISHED",
        role: 'SUPER ADMIN', 
        
      },
    ]

    const createdUsers = await User.insertMany(users)

    console.log("created user",createdUsers);
    
    // const adminUser = createdUsers[0]._id

    // const sampleProducts = products.map((product) => {
    //   return { ...product, user: adminUser }
    // })

    // await Product.insertMany(sampleProducts)

    // await TyreWidth.insertMany([
    //   { name: '125', width_type: 'MM' },
    //   { name: '135', width_type: 'MM' },
    //   { name: '145', width_type: 'MM' },
    //   { name: '155', width_type: 'MM' },
    //   { name: '165', width_type: 'MM' },
    //   { name: '175', width_type: 'MM' },
    //   { name: '185', width_type: 'MM' },
    //   { name: '195', width_type: 'MM' },
    //   { name: '205', width_type: 'MM' },
    //   { name: '215', width_type: 'MM' },
    //   { name: '225', width_type: 'MM' },
    //   { name: '235', width_type: 'MM' },
    //   { name: '245', width_type: 'MM' },
    //   { name: '255', width_type: 'MM' },
    //   { name: '265', width_type: 'MM' },
    //   { name: '275', width_type: 'MM' },
    //   { name: '285', width_type: 'MM' },
    //   { name: '295', width_type: 'MM' },
    //   { name: '305', width_type: 'MM' },
    //   { name: '315', width_type: 'MM' },
    //   { name: '325', width_type: 'MM' },
    //   { name: '335', width_type: 'MM' },
    //   { name: '345', width_type: 'MM' },
    //   { name: '355', width_type: 'MM' },
    //   { name: '365', width_type: 'MM' },
    //   { name: '70', width_type: 'MM' },
    //   { name: '80', width_type: 'MM' },
    //   { name: '90', width_type: 'MM' },
    //   { name: '100', width_type: 'MM' },
    //   { name: '110', width_type: 'MM' },
    //   { name: '120', width_type: 'MM' },
    //   { name: '130', width_type: 'MM' },
    //   { name: '140', width_type: 'MM' },
    //   { name: '150', width_type: 'MM' },
    //   { name: '160', width_type: 'MM' },
    //   { name: '170', width_type: 'MM' },
    //   { name: '180', width_type: 'MM' },
    //   { name: '190', width_type: 'MM' },
    //   { name: '200', width_type: 'MM' },
    //   { name: '210', width_type: 'MM' },
    //   { name: '7.50X', width_type: 'INCH' },
    //   { name: '8.25X', width_type: 'INCH' },
    //   { name: '7.00X', width_type: 'INCH' },
    //   { name: '2.75X', width_type: 'INCH' },
    //   { name: '3.00X', width_type: 'INCH' },
    //   { name: '3.25X', width_type: 'INCH' },
    //   { name: '3.50X', width_type: 'INCH' },
    //   { name: '3.75X', width_type: 'INCH' },
    //   { name: '4.50X', width_type: 'INCH' },
    //   { name: '5.00X', width_type: 'INCH' },
    //   { name: '12.4X', width_type: 'INCH' },
    //   { name: '13.6X', width_type: 'INCH' },
    //   { name: '14.9X', width_type: 'INCH' },
    //   { name: '16.9X', width_type: 'INCH' },
    //   { name: '18.4X', width_type: 'INCH' },
    //   { name: '11.2X', width_type: 'INCH' },
    //   { name: '6.00X', width_type: 'INCH' },
    //   { name: '7.50X', width_type: 'INCH' },
    //   { name: '6.50X', width_type: 'INCH' },
    //   { name: '7.50X', width_type: 'INCH' },
    //   { name: '8.25X', width_type: 'INCH' },
    //   { name: '9.00X', width_type: 'INCH' },
    //   { name: '10.00X', width_type: 'INCH' },
    //   { name: '11.00X', width_type: 'INCH' },
    //   { name: '12.00X', width_type: 'INCH' },
    //   { name: '13.00X', width_type: 'INCH' },
    //   { name: '14.00X', width_type: 'INCH' },
    //   { name: '11.00X', width_type: 'INCH' },
    //   { name: '12.00X', width_type: 'INCH' },
    // ]);

  // await User.inser


    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // await Order.deleteMany();
    // await Product.deleteMany();
    // await User.deleteMany();

    // console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
