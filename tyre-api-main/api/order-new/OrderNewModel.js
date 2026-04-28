import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
import { ORDER_STATUS, PAYMENT_METHOD } from '../../utils/constant';
const AutoIncrement = AutoIncrementField(mongoose);

const orderSchema = mongoose.Schema(
  {
    order_date: {
      type: Date,
      required: false,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      options: ORDER_STATUS,
    },
    is_paid: {
      type: Boolean,
      required: false,
      default: false,
    },
    payment_method: {
      type: String,
      required: false,
      options: PAYMENT_METHOD,
    },
    products_total: {
      type: Number,
      required: true,
    },
    delivery_charges: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
    },
    tax: {
      type: Number,
      required: false,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    address: {
      address_1: {
        type: String,
        required: true,
      },
      address_2: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: false,
      },
      pin: {
        type: Number,
        required: true,
      },
      landmark: {
        type: String,
        required: false,
      },
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: true,
      },
      customer: {
        type: String,
        required: false,
      },
    },
    orders: [
      {
        order_id: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        regular_price: {
          type: Number,
          required: false,
        },
        sale_price: {
          type: Number,
          required: false,
        },
        image: {
          type: String,
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
        },
        sub_total: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: false,
        },
        delivery_charges: {
          type: Number,
          required: false,
        },
        tax: {
          type: Number,
          required: false,
        },
        order_status: {
          type: String,
          required: true,
          options: ORDER_STATUS,
        },
        payment_method: {
          type: String,
          required: false,
          options: PAYMENT_METHOD,
        },
        is_paid: {
          type: Boolean,
          required: false,
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: 'User',
        },
        allow_return: {
          type: Boolean,
          required: false,
          default: false,
        },
        commission: {
          is_paid: {
            type: Boolean,
            required: false,
            default: false,
          },
          commission_percentage: {
            type: Number,
            required: false,
          },
          commission_amount: {
            type: Number,
            required: false,
          },
          cod_charges: {
            type: Number,
            required: false,
            default: 0,
          },
          delivery_charges: {
            type: Number,
            required: false,
            default: 0,
          },
          tax: {
            type: Number,
            required: false,
            default: 0,
          },
          total_commission_amount: {
            type: Number,
            required: false,
            default: 0,
          },
        },
        shipping: {
          order_id: {
            type: String,
            required: false,
          },
          awb: {
            type: String,
            required: false,
          },
          current_status: {
            type: String,
            required: false,
          },
          current_status_id: {
            type: String,
            required: false,
          },
          shipment_status: {
            type: String,
            required: false,
          },
          shipment_status_id: {
            type: String,
            required: false,
          },
          current_timestamp: {
            type: String,
            required: false,
          },
          channel_order_id: {
            type: String,
            required: false,
          },
          channel: {
            type: String,
            required: false,
          },

          courier_name: {
            type: String,
            required: false,
          },
          etd: {
            type: String,
            required: false,
          },
          is_return: {
            type: String,
            required: false,
          },

          scans: [
            {
              date: {
                type: String,
                required: false,
              },
              activity: {
                type: String,
                required: false,
              },
              location: {
                type: String,
                required: false,
              },
            },
          ],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.plugin(AutoIncrement, {
  inc_field: 'order_id',
  start_seq: 1000,
});

const Order = mongoose.model('OrderNew', orderSchema);

export default Order;
