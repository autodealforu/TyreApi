import { LOGO, SERVER_URL, URI_SITE, ADDRESS } from '../constant.js';
import moment from 'moment';

export const EMAIL_TEMPLATE = ({ order }) => {
  console.log(LOGO, SERVER_URL, URI_SITE, ADDRESS);
  let products = ``;
  if (order.products) {
    order.products.map((item) => {
      let imageCell = ``;
      if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
        let imageUrl = item.image.trim();
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          const baseUrl = (SERVER_URL || 'https://admin.autodeal4u.in').replace(/\/$/, '');
          const cleanPath = imageUrl.replace(/^\//, '');
          imageUrl = `${baseUrl}/${cleanPath}`;
        }
        imageCell = `<img src="${imageUrl}" alt="${item.name || 'Product'}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;" />`;
      } else {
        imageCell = `<div style="width:60px;height:60px;background-color:#edf2f7;border-radius:6px;display:inline-block;line-height:60px;text-align:center;color:#a0aec0;font-size:10px;font-weight:bold;">TYRE</div>`;
      }

      const itemPrice = item.sale_price || item.regular_price || 0;
      const sku = item.sku || item.product?.sku || item.product?.model || '';

      products += ` <tr>
      <td style="padding: 6px 12px; vertical-align: top;">${imageCell}</td>
      <td
        style="
          padding: 6px 12px;
          font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 22px;
          vertical-align: top;
        "
      >
        <p style="margin: 0; font-weight: bold; color: #1a202c;">${item.name || 'Product'} * ${item.quantity || 1}</p>
        ${sku ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #718096;">SKU: ${sku}</p>` : ''}
      </td>
     
      <td
        align="right"
        style="
          padding: 6px 12px;
          font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 22px;
          font-weight: bold;
          color: #2d3748;
          vertical-align: top;
          width:25%;
        "
      >
        Rs. ${(itemPrice * (item.quantity || 1)).toLocaleString('en-IN')}
      </td>
    </tr>`;
    });
  }
  const HTMLTEXT = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <title>Email Receipt</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style type="text/css">
        /**
     * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
     */
        @media screen {
          @font-face {
            font-family: "Source Sans Pro";
            font-style: normal;
            font-weight: 400;
            src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
              url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
                format("woff");
          }
  
          @font-face {
            font-family: "Source Sans Pro";
            font-style: normal;
            font-weight: 700;
            src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
              url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
                format("woff");
          }
        }
  
        /**
     * Avoid browser level font resizing.
     * 1. Windows Mobile
     * 2. iOS / OSX
     */
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%; /* 1 */
          -webkit-text-size-adjust: 100%; /* 2 */
        }
  
        /**
     * Remove extra space added to tables and cells in Outlook.
     */
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
  
        /**
     * Better fluid images in Internet Explorer.
     */
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        /**
     * Remove blue links for iOS devices.
     */
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
  
        /**
     * Fix centering issues in Android 4.4.
     */
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
  
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
  
        /**
     * Collapse table borders to avoid space between cells.
     */
        table {
          border-collapse: collapse !important;
        }
  
        a {
          color: #1a82e2;
        }
  
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
      </style>
    </head>
    <body style="background-color: #f1f1f1">
      <!-- start preheader -->
      <div
        class="preheader"
        style="
          display: none;
          max-width: 0;
          max-height: 0;
          overflow: hidden;
          font-size: 1px;
          line-height: 1px;
          color: #fff;
          opacity: 0;
        "
      >
      Thank you for shopping with us! Your order has been placed with us successfully on ${moment(
        order.order_date
      ).format('DD-MMM-YYYY')}. 
      </div>
      <!-- end preheader -->
  
      <!-- start body -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- start logo -->
        <tr>
          <td align="center" bgcolor="#f1f1f1">
            <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td align="center" valign="top" width="600">
          <![endif]-->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px"
            >
              <tr>
                <td align="center" valign="top" style="padding: 36px 24px">
                  <a
                    href="${URI_SITE || 'https://autodeal4u.in'}"
                    target="_blank"
                    style="display: inline-block; text-decoration: none;"
                  >
                    <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #1A365D; text-transform: uppercase;">
                      AUTODEAL<span style="color: #2B6CB0;">4U</span>
                    </span>
                  </a>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
          </td>
        </tr>
        <!-- end logo -->
  
        <!-- start hero -->
        <tr>
          <td align="center" bgcolor="#f1f1f1">
            <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td align="center" valign="top" width="600">
          <![endif]-->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px"
            >
              <tr>
                <td
                  align="left"
                  bgcolor="#ffffff"
                  style="
                    padding: 36px 24px 0;
                    font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                    border-top: 3px solid #d4dadf;
                  "
                >
                  <h1
                    style="
                      margin: 0;
                      font-size: 24px;
                      font-weight: 700;
                      letter-spacing: -1px;
                      line-height: 48px;
                    "
                  >
                  Hi ${order.customer.name},
                  </h1>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
          </td>
        </tr>
        <!-- end hero -->
  
        <!-- start copy block -->
        <tr>
          <td align="center" bgcolor="#f1f1f1">
            <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td align="center" valign="top" width="600">
          <![endif]-->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px"
            >
              <!-- start copy -->
              <tr>
                <td
                  align="left"
                  bgcolor="#ffffff"
                  style="
                    padding: 24px;
                    font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                <p> Your order has been placed successfully.

                </p> 
                  <p style="margin: 0">
                  Thank you for shopping with us! Your order has been placed with us successfully on ${moment(
                    order.order_date
                  ).format('DD-MMM-YYYY')}. 
                  Once packed and shipped, we shall update you on the promised date of delivery.
                  </p>
                </td>
              </tr>
              <!-- end copy -->
  
              <!-- start receipt table -->
              <tr>
                <td
                  align="left"
                  bgcolor="#ffffff"
                  style="
                    padding: 24px;
                    font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td
                        align="left"
                        bgcolor="#f1f1f1"
                        width="75%"
                        style="
                          padding: 12px;
                          font-family: 'Source Sans Pro', Helvetica, Arial,
                            sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                        "
                        colspan="3"
                      >
                        <strong>Order #</strong>
                      </td>
                      <td
                        align="left"
                        bgcolor="#f1f1f1"
                        width="25%"
                        style="
                          padding: 12px;
                          font-family: 'Source Sans Pro', Helvetica, Arial,
                            sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                        "
                      >
                        <strong> ${order.order_id} </strong>
                      </td>
                    </tr>
                    ${products}
                   
                   
                   
                   
                
                    
                    <tr>
                      <td
                        align="left"
                        width="75%"
                        style="
                          padding: 12px;
                          font-family: 'Source Sans Pro', Helvetica, Arial,
                            sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                          border-top: 2px dashed #f1f1f1;
                          border-bottom: 2px dashed #f1f1f1;
                        "
                      >
                        <strong>Total</strong>
                      </td>
                      <td
                        align="left"
                        width="25%"
                        style="
                          padding: 12px;
                          font-family: 'Source Sans Pro', Helvetica, Arial,
                            sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                          border-top: 2px dashed #f1f1f1;
                          border-bottom: 2px dashed #f1f1f1;
                        "
                      >
                        <strong> ${
                          order.total_amount ? order.total_amount : 0
                        } </strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end reeipt table -->
            </table>
            <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
          </td>
        </tr>
        <!-- end copy block -->
  
        <!-- start receipt address block -->
        <tr>
          <td align="center" bgcolor="#f1f1f1" valign="top" width="100%">
            <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td align="center" valign="top" width="600">
          <![endif]-->
            <table
              align="center"
              bgcolor="#ffffff"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px"
            >
              <tr>
                <td
                  align="center"
                  valign="top"
                  style="font-size: 0; border-bottom: 3px solid #d4dadf"
                >
                  <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="left" valign="top" width="300">
                <![endif]-->
                  <div
                    style="
                      display: inline-block;
                      width: 100%;
                      max-width: 100%;
                      min-width: 240px;
                      vertical-align: top;
                    "
                  >
                    <table
                      align="left"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 300px"
                    >
                      <tr>
                        <td
                          align="left"
                          valign="top"
                          style="
                            padding-bottom: 36px;
                            padding-left: 36px;
                            font-family: 'Source Sans Pro', Helvetica, Arial,
                              sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          <p><strong>Delivery Address</strong></p>

                          <p>
                          <strong> ${
                            order.customer ? order.customer.name : 'Customer'
                          }  </strong> <br />
                           ${
                             order.shipping_address
                               ? order.shipping_address.address_1
                               : ''
                           }  ${
    order.shipping_address && order.shipping_address.address_2
      ? order.shipping_address.address_2
      : ''
  } <br />
                           ${
                             order.shipping_address &&
                             order.shipping_address.landmark
                               ? order.shipping_address.landmark
                               : ''
                           } <br />
                           ${
                             order.shipping_address
                               ? order.shipping_address.city
                               : ''
                           } ${
    order.shipping_address ? order.shipping_address.state : ''
  } ${order.shipping_address ? order.shipping_address.pin : ''}

                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!--[if (gte mso 9)|(IE)]>
                </td>
                
                </tr>
                </table>
                <![endif]-->
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
          </td>
        </tr>
        <!-- end receipt address block -->
  
        <!-- start footer -->
        <tr>
          <td align="center" bgcolor="#f1f1f1" style="padding: 24px">
            <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td align="center" valign="top" width="600">
          <![endif]-->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px"
            >
              <!-- start permission -->
              <tr>
                <td
                  align="center"
                  bgcolor="#f1f1f1"
                  style="
                    padding: 12px 24px;
                    font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                    color: #666;
                  "
                >
                  <p style="margin: 0">
                  We do not demand your banking and credit card details verbally or telephonically. Please do not divulge your details to fraudsters and imposters falsely claiming to be calling on our behalf.
                  </p>
                </td>
              </tr>
              <!-- end permission -->
  
              <!-- start unsubscribe -->
              <tr>
                <td
                  align="center"
                  bgcolor="#f1f1f1"
                  style="
                    padding: 12px 24px;
                    font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                    color: #666;
                  "
                >
                  
                  <p style="margin: 0">
                    ${ADDRESS}
                  </p>
                </td>
              </tr>
              <!-- end unsubscribe -->
            </table>
            <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
          </td>
        </tr>
        <!-- end footer -->
      </table>
      <!-- end body -->
    </body>
  </html>
  `;

  return HTMLTEXT;
};
