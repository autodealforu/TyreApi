import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
// import Product from '../products/ProductModel';

import checkRequired from '../../utils/checkRequired.js';
// import Collection from '../collections/CollectionModel.js';
import Productcategory from '../productcategorys/ProductcategoryModel.js';
import SubCategory from '../subcategorys/SubCategoryModel.js';
import SubSubCategory from '../subsubcategorys/SubSubCategoryModel.js';
// import User from '../users/UserModel.js';
import { readExcelFile } from './ReadXLSX.js';
import axios from 'axios';
import { download } from './DownloadFile.js';
import { response } from 'express';
import { VariationAttrs, VariationTable } from './VariationTable.js';
import Product from '../products/ProductModel.js';

const addBulk = asyncHandler(async (req, res) => {
  try {
    console.log('Reading Excel File');
    const { file, product_category, sub_category, sub_sub_category } = req.body;

    // Check if product_category exists
    const productCategory = await Productcategory.findById(product_category);
    if (!productCategory) {
      res.status(404);
      throw new Error('Product Category not found');
    }
    // Check if sub_category exists
    if (sub_category) {
      const subCategory = await SubCategory.findById(sub_category);
      if (!subCategory) {
        res.status(404);
        throw new Error('Sub Category not found');
      }
    }
    // Check if sub_sub_category exists
    if (sub_sub_category) {
      const subSubCategory = await SubSubCategory.findById(sub_sub_category);
      if (!subSubCategory) {
        res.status(404);
        throw new Error('Sub Sub Category not found');
      }
    }
    // Check if file exists
    if (!file) {
      res.status(404);
      throw new Error('File not found');
    }

    // remove first / from file
    const filePath = file.substring(1);
    // const filePath = file;

    const uploadedFile = await readExcelFile(filePath);
    console.log(uploadedFile, 'uploadedFile');

    const promises = uploadedFile?.map(async (item) => {
      let product_images = [];
      // Check if regular price and sale price exists
      if (!item.regular_price) {
        res.status(404);
        throw new Error('Regular Price not found');
      }
      if (!item.sale_price) {
        res.status(404);
        throw new Error('Sale Price not found');
      }
      // Download all images from url and return array of images
      // check if media exists
      if (item.media) {
        const images = item.media.split(',');
        const promises2 = await images?.map(async (image) => {
          const url = image;
          const dest = `./uploads/${Date.now()}-${image.split('/').pop()}`;
          const result_data = await download(url, dest, (err, success) => {
            if (err) {
              console.log('Error', err);
            }

            return dest;
          });
          product_images.push(dest.substring(1));
        });

        await Promise.all(promises2);
        console.log(product_images, 'product_images');
      }
      item.media = product_images;

      // Check if Variation image 1
      if (item.variation_1_images) {
        const images = item.variation_1_images.split(',');
        let variation_1_images = [];
        console.log('Images', images);
        // Download all images from url using https
        // const promises2 = await images?.map(async (image) => {

        // end downloading all images from url
        const promises2 = await images?.map(async (image) => {
          const url = image;
          const dest = `./uploads/${Date.now()}-${image.split('/').pop()}`;
          const result_data = await download(url, dest, (err, success) => {
            if (err) {
              console.log(err);
            }

            return dest;
          });
          variation_1_images.push(dest.substring(1));
        });

        await Promise.all(promises2);
        console.log(product_images, 'product_images');
        item.variation_1_images = variation_1_images;
      }
      // Check if Variation image 2
      if (item.variation_2_images) {
        const images = item.variation_2_images.split(',');
        let variation_2_images = [];
        const promises2 = await images?.map(async (image) => {
          const url = image;
          const dest = `./uploads/${Date.now()}-${image.split('/').pop()}`;
          const result_data = await download(url, dest, (err, success) => {
            if (err) {
              console.log(err);
            }

            return dest;
          });
          variation_2_images.push(dest.substring(1));
        });

        await Promise.all(promises2);
        console.log(product_images, 'product_images');
        item.variation_2_images = variation_2_images;
      }
      // Check if Variation image 3
      if (item.variation_3_images) {
        const images = item.variation_3_images.split(',');
        let variation_3_images = [];
        const promises2 = await images?.map(async (image) => {
          const url = image;
          const dest = `./uploads/${Date.now()}-${image.split('/').pop()}`;
          const result_data = await download(url, dest, (err, success) => {
            if (err) {
              console.log(err);
            }

            return dest;
          });
          variation_3_images.push(dest.substring(1));
          item.variation_3_images = variation_3_images;
        });

        await Promise.all(promises2);
        console.log(product_images, 'product_images');
      }

      // Check if in_stock exists and YES
      if (item.in_stock === 'YES') {
        item.in_stock = true;
      }
      // Check if in_stock exists and NO
      if (item.in_stock === 'NO') {
        item.in_stock = false;
      }
      // Check if available sizes are provided
      if (item.available_sizes) {
        item.available_sizes = item.available_sizes.split(',');
      }
      // Check if available colors are provided
      if (item.colors) {
        item.colors = item.colors.split(',');
      }

      const variation_attrs = VariationAttrs({
        sizes: item.available_sizes,
        colors: item.colors,
      });
      const variation = VariationTable({ variation_attrs, data: item });
      console.log('variation', variation);
      item.variation_attrs = variation_attrs;
      item.variations = variation;
      item.product_category = product_category;
      item.sub_category = sub_category;
      item.sub_sub_category = sub_sub_category;
      item.is_variable_product = true;
      item.slug = slugify(item.name, { lower: true });
      if (req.user && req.user.role === 'VENDOR') {
        item['vendor'] = req.user._id;
      }
      const product = new Product(item);
      const createdProduct = await product.save();
      const newData = await Product.findById(createdProduct._id);
      newData.slug = `${newData.slug}-${newData.product_id}`;
      const updatedProduct = await newData.save();
      console.log('Product', product);
    });
    await Promise.all(promises);
    // Download all images from url using https
    // const images = uploadedFile?.map(async (item) => {

    res.send(uploadedFile);
  } catch (error) {
    console.log('Error', err);
  }
});
export { addBulk };
