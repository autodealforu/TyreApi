import asyncHandler from 'express-async-handler';
import Product from '../products/ProductModel.js';
import {URI_SITE,SERVER_URL } from "../../utils/constant.js";


function escapeXml(unsafe) {
  if (typeof unsafe === 'string' || unsafe instanceof String) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
      }
    });
  } else {
    return '';
  }
}


function generateProductXML(products) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">';
    xml += '<channel>';
    // Loop through your product data and generate an <item> element for each product
    products.forEach((product) => {
      if ((product.product_status && product.product_status !== "Active")||(product.in_stock && product.in_stock !== true) || (product.vendor && product.vendor.vendor && product.vendor.vendor.profile_status !== "APPROVED") || (product.vendor && product.vendor.vendor && product.vendor.vendor.store_active !== true)) {
        return;
      }
      let storeName = (product.vendor && product.vendor.vendor && product.vendor.vendor.store_name)?product.vendor.vendor.store_name:"";
      let mediaFile = (product.media[0]?product.media[0].replace(/^\/+/, ''):"")

      if (product.variations.length > 0) {
        product.variations.forEach((variation, index) => {
                if(variation.media.length <= 0)
                        return;
                xml += '<item>';
                xml += `<g:id>${product.product_id}-${index + 1}</g:id>`;
                xml += `<g:title><![CDATA[${escapeXml(product.name)}]]></g:title>`;
                xml += `<g:description><![CDATA[${escapeXml(product.description)}]]></g:description>`;
                xml += `<g:link><![CDATA[${URI_SITE + `product/` + product.slug+`?variation=`+variation._id}]]></g:link>`;
                xml += `<g:item_group_id>${product.product_id}</g:item_group_id>`;
                xml += `<g:brand><![CDATA[${escapeXml(storeName)}]]></g:brand>`;
                xml += `<g:availability>In_Stock</g:availability>`;
                xml += `<g:condition>New</g:condition>`;
                xml += `<g:price>${variation.sale_price} INR</g:price>`;
                let regularPrice = variation.regular_price || variation.sale_price;
                xml += `<g:regular_price>${regularPrice} INR</g:regular_price>`;
                let vmediaFile = (variation.media[0]?variation.media[0].replace(/^\/+/, ''):"");
                xml += `<g:image_link><![CDATA[${SERVER_URL + escapeXml(vmediaFile)}]]></g:image_link>`;
                variation.media.slice(1).forEach((image) => {
                       xml += `<g:additional_image_link><![CDATA[${SERVER_URL + escapeXml(image)}]]></g:additional_image_link>`;
                });

                if (variation.options.length > 0) {
                  variation.options.forEach((option) => {
                     if(option.label && (option.label.toUpperCase()==='COLOR' || option.label.toUpperCase()==='SIZE')){
                        xml += `<g:${option.label.toLowerCase()}>${escapeXml(option.value)}</g:${option.label.toLowerCase()}>`;
                     }
                     else if(option.label && (option.label.toUpperCase().includes('SIZE'))){
                        xml += `<g:size>${escapeXml(option.value)}</g:size>`;
                     }
                  });
                }
                if (product.name.toLowerCase().includes('women')) {
                   xml += `<g:gender>Female</g:gender>`;
                } else if (product.name.toLowerCase().includes('men')) {
                   xml += `<g:gender>Male</g:gender>`;
                }
                xml += `<g:gtin></g:gtin>`;
                xml += `<g:mpn></g:mpn>`;
                xml +=`<g:identifier_exists>FALSE</g:identifier_exists>`;
                xml +=`<g:product_type> </g:product_type>`;
                xml +=`<g:google_product_category> </g:google_product_category>`;
                xml +=`<g:shipping>`;
                xml +=`<g:country>IN</g:country>`;
                xml +=`<g:service>Standard</g:service>`;
                xml +=`<g:price>0.00 INR</g:price>`;
                xml +=`</g:shipping>`;
                xml += '</item>';
        });
      }else{
               xml += '<item>';
                xml += `<g:id>${product.product_id}</g:id>`;
                xml += `<g:title><![CDATA[${escapeXml(product.name)}]]></g:title>`;
                xml += `<g:description><![CDATA[${escapeXml(product.description)}]]></g:description>`;
                xml += `<g:link><![CDATA[${URI_SITE + `product/` + product.slug}]]></g:link>`;
                xml += `<g:item_group_id>${product.product_id}</g:item_group_id>`;
                xml += `<g:brand><![CDATA[${escapeXml(storeName)}]]></g:brand>`;
                xml += `<g:availability>In_Stock</g:availability>`;
                xml += `<g:condition>New</g:condition>`;
                xml += `<g:price>${product.sale_price} INR</g:price>`;
                let regularPrice = product.regular_price || product.sale_price;
                xml += `<g:regular_price>${regularPrice} INR</g:regular_price>`;
                let vmediaFile = (product.media[0]?product.media[0].replace(/^\/+/, ''):"");
                xml += `<g:image_link><![CDATA[${SERVER_URL + escapeXml(vmediaFile)}]]></g:image_link>`;
                product.media.slice(1).forEach((image) => {
                       xml += `<g:additional_image_link><![CDATA[${SERVER_URL + escapeXml(image)}]]></g:additional_image_link>`;
                });
                if (product.name.toLowerCase().includes('women')) {
                   xml += `<g:gender>Female</g:gender>`;
                } else if (product.name.toLowerCase().includes('men')) {
                   xml += `<g:gender>Male</g:gender>`;
                }
                xml += `<g:gtin></g:gtin>`;
                xml += `<g:mpn></g:mpn>`;
                xml +=`<g:identifier_exists>FALSE</g:identifier_exists>`;
                xml +=`<g:product_type> </g:product_type>`;
                xml +=`<g:google_product_category> </g:google_product_category>`;
                xml +=`<g:shipping>`;
                xml +=`<g:country>IN</g:country>`;
                xml +=`<g:service>Standard</g:service>`;
                xml +=`<g:price>0.00 INR</g:price>`;
                xml +=`</g:shipping>`;
                xml += '</item>';
      }
   });

    xml += '</channel>';
    xml += '</rss>';

    return xml;
  }

function generateProductJson(products) {
  const uniqueProducts = new Map(); // Use a Map to store unique products based on product_id

  products.forEach((product) => {
    if ((product.product_status && product.product_status !== "Active") || (product.in_stock && product.in_stock !== true)) {
      return;
    }

    let storeName = (product.vendor && product.vendor.vendor && product.vendor.vendor.store_name) ? product.vendor.vendor.store_name : "";

    if (product.variations.length > 0) {
      product.variations.forEach((variation, index) => {
        if (!variation.media || variation.media.length === 0) {
          const masterProductId = product.product_id;
          if (!uniqueProducts.has(masterProductId)) {
            const variationData = {
              product_id: masterProductId,
              title: escapeXml(product.name),
              store_name: escapeXml(storeName),
            };
            uniqueProducts.set(masterProductId, variationData);
          }
        }
      });
    }
  });

  return Array.from(uniqueProducts.values());
}


// @desc    Fetch all products
// @route   GET /api/products/all
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    searchParams['product_status'] = 'Active';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const products = await Product.find({ ...searchParams })
      .populate('collections')
      .populate('vendor')
      .populate('categories');
    //const jsonData = generateProductJson(products);
    //res.json(products);
    const xml = generateProductXML(products);
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=googlefeed.xml');
    res.status(200).end(xml);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong'+error);
  }
});

export {
  getAllProducts
};
