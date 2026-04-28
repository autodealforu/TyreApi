import sendEmail from '../../utils/mail.js';
import { EMAIL_TEMPLATE } from '../../utils/template/Template.js';
import Notification from '../notifications/NotificationModel.js';
import Productcategory from '../productcategorys/ProductcategoryModel.js';
import Product from '../products/ProductModel.js';
import SubCategory from '../subcategorys/SubCategoryModel.js';
import SubSubCategory from '../subsubcategorys/SubSubCategoryModel.js';
import User from '../users/UserModel.js';
import Order from './OrderModel.js';
import request from 'request';

const getOrdersDataToCreateFunction = async ({ product, order_data }) => {
  if (product && product.product) {
    const product_details = await Product.findById(product.product);
    if (product_details) {
      // Find out the commission of sub_sub_category

      let commission_amount = 0;
      let commission_percentage = 0;
      if (product_details.sub_sub_category) {
        const sub_sub_category = await SubSubCategory.findById(
          product_details.sub_sub_category
        );
        const commission = sub_sub_category.commission;
        commission_percentage = commission;
        commission_amount = (product.sale_price * commission) / 100;
      } else {
        if (product_details.sub_category) {
          const sub_sub_category = await SubCategory.findById(
            product_details.sub_category
          );
          const commission = sub_sub_category.commission;
          commission_percentage = commission;
          commission_amount = (product.sale_price * commission) / 100;
        } else {
          if (product_details.product_category) {
            const sub_sub_category = await Productcategory.findById(
              product_details.product_category
            );
            const commission = sub_sub_category.commission;
            commission_percentage = commission;
            commission_amount = (product.sale_price * commission) / 100;
          }
        }
      }
      const total_commission_amount = commission_amount * product.quantity;
      const total_commission_amount_gst = total_commission_amount * 0.18;
      const total_commission_amount_with_gst =
        total_commission_amount + total_commission_amount_gst;
      const total_cod_charges = order_data.payment_method == 'COD' ? 60 : 0;

      const commission_object = {
        is_paid: false,
        commission_percentage: commission_percentage,
        commission_amount: total_commission_amount,
        cod_charges: total_cod_charges,
        tax: total_commission_amount_gst,
        sub_commission_amount: total_commission_amount_with_gst,
      };

      console.log('order_data', order_data);

      const orderDataForEntry = {
        status: order_data.status,
        is_paid: order_data.is_paid,
        payment_method: order_data.payment_method,
        total_amount: parseFloat(
          product.quantity * product.sale_price + order_data.delivery_charges
        ).toFixed(2),
        sub_total: product.quantity * product.sale_price,
        tax: product_details.tax ? product_details.tax : 0,
        discount: order_data.discount ? order_data.discount : 0,
        delivery_charges: order_data.delivery_charges
          ? order_data.delivery_charges
          : 0,
        address: order_data.address,
        customer: order_data.customer,
        products: [product],
        vendor: product_details.vendor,
        created_by: order_data.created_by,
        commission: commission_object,
      };
      console.log('orderDataForEntry', orderDataForEntry);
      // return orderDataForEntry;
      const order = new Order(orderDataForEntry);
      const createdOrder = await order.save();

      const vendorDetails = await User.findById(product_details.vendor);

      if (
        createdOrder &&
        createdOrder.customer &&
        createdOrder.customer.email &&
        createdOrder.status == 'PROCESSING'
      ) {
        sendEmail({
          to: createdOrder.customer.email,
          subject: `Your order #${createdOrder.order_id} has been placed successfully`,
          html: EMAIL_TEMPLATE({ order: createdOrder }),
        });
        sendEmail({
          to: vendorDetails.email,
          subject: `New order #${createdOrder.order_id} has been received`,
          html: EMAIL_TEMPLATE({ order: createdOrder }),
        });

        var options = {
          method: 'POST',
          url: 'https://api.textlocal.in/send/',
          formData: {
            apiKey: 'Nzg3OTc3NGU2MzYyNjM3MjM2NTE0ZjYzNmIzMzZkMzM=',
            numbers: `91${createdOrder.customer.phone}`,
            sender: 'RAREOD',
            message: `Dear%20${createdOrder.customer.name}%2C%20your%20order%20id%20${createdOrder.order_id}%20is%20successfully%20placed%20and%20it%20will%20be%20delivered%20within%205-7%20working%20days.`,
          },
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });

        // sendEmail({
        //   to: createdOrder.customer.email,
        //   subject: `Order #${createdOrder.order_id} has been placed successfully`,
        //   html: EMAIL_TEMPLATE({ order: createdOrder }),
        // });
        const notification = new Notification({
          notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
          order: createdOrder._id,
        });

        const createdNotification = await notification.save();
        const notification_vendor = new Notification({
          notes: `<p>  Order #${createdOrder.order_id} of amount ${createdOrder.total_amount} is received. Please check. </p>`,
          order: createdOrder._id,
          user: vendorDetails._id,
        });

        const createdNotificationVendor = await notification_vendor.save();
      }
    }
  }
};

export { getOrdersDataToCreateFunction };
