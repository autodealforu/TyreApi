import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './orders_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

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
      enum: [
        'PENDING',
        'PROCESSING',
        'ACCEPTED',
        'READY_TO_DISPATCH',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'INSTALLATION_PENDING',
        'INSTALLATION_SCHEDULED',
        'INSTALLATION_COMPLETED',
        'RTO',
        'RETURN_REQUEST',
        'RETURN_CANCELLED',
        'RETURN_ACCEPTED',
        'RETURN_COMPLETED',
        'INCORRECT',
        'REFUNDED',
        'CANCELLED',
        'FAILED',
        'RETURNED',
      ],
    },
    is_paid: {
      type: Boolean,
      required: false,
      default: false,
    },
    payment_method: {
      type: String,
      required: false,
      enum: ['ONLINE', 'COD'],
    },
    total_amount: {
      type: Number,
      required: true,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: false,
      default: 0,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    delivery_charges: {
      type: Number,
      required: false,
      default: 0,
    },

    // UPDATED: Separate shipping and billing addresses
    shipping_address: {
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
    billing_address: {
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
      same_as_shipping: {
        type: Boolean,
        default: true,
      },
    },

    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: false,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
      },
    },

    // UPDATED: Enhanced products array with vendor support
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User', // Vendor reference
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        brand: {
          type: String,
          required: false,
        },
        size: {
          type: String,
          required: false,
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
        installation_fee: {
          type: Number,
          required: false,
          default: 0,
        },
        vendor_details: {
          name: {
            type: String,
            required: false,
          },
          store_name: {
            type: String,
            required: false,
          },
          location: {
            type: String,
            required: false,
          },
          phone: {
            type: String,
            required: false,
          },
        },
      },
    ],

    // NEW: Delivery details
    delivery_details: {
      option: {
        type: String,
        enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'],
        default: 'STANDARD',
      },
      estimated_delivery: {
        type: Date,
        required: false,
      },
      delivery_time_slot: {
        type: String,
        required: false,
      },
      delivery_charges: {
        type: Number,
        required: false,
        default: 0,
      },
    },

    // NEW: Installation details
    installation_details: {
      option: {
        type: String,
        enum: ['STORE', 'HOME', 'NONE'],
        default: 'STORE',
      },
      total_installation_fee: {
        type: Number,
        default: 0,
      },
      scheduled_date: {
        type: Date,
        required: false,
      },
      scheduled_time_slot: {
        type: String,
        required: false,
      },
      installation_address: {
        // Same structure as shipping_address, used when option is 'HOME'
        address_1: {
          type: String,
          required: false,
        },
        address_2: {
          type: String,
          required: false,
        },
        city: {
          type: String,
          required: false,
        },
        state: {
          type: String,
          required: false,
        },
        pin: {
          type: Number,
          required: false,
        },
        landmark: {
          type: String,
          required: false,
        },
      },
      special_instructions: {
        type: String,
        required: false,
      },
    },

    // NEW: Payment gateway integration fields
    payment_details: {
      gateway: {
        type: String,
        enum: ['RAZORPAY', 'PAYU', 'STRIPE', 'PHONEPE', 'PAYTM'],
        required: false,
      },
      transaction_id: {
        type: String,
        required: false,
      },
      payment_status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
      },
      payment_amount: {
        type: Number,
        required: false,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      payment_date: {
        type: Date,
        required: false,
      },
      refund_amount: {
        type: Number,
        required: false,
        default: 0,
      },
      refund_date: {
        type: Date,
        required: false,
      },
    },

    courier_details: {
      length: String,
      width: String,
      height: String,
      breadth: String,
      weight: String,
      shipment_id: String,
      courier: String,
      logistics_partner: String,
      lr_number: String,
      dispatch_details: String,
    },

    // ENHANCED: Shipping details with multi-vendor support
    shipping_details: {
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
    },

    logistic_partner_name: {
      type: String,
      required: false,
    },
    dispatch_number: {
      type: String,
      required: false,
    },

    // NEW: Order notes and communication
    order_notes: [
      {
        note: String,
        added_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note_type: {
          type: String,
          enum: ['INTERNAL', 'CUSTOMER', 'VENDOR'],
          default: 'INTERNAL',
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    published_status: {
      type: String,
      required: false,
      enum: ['PUBLISHED', 'DRAFT'],
      default: 'PUBLISHED',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment order ID
orderSchema.plugin(AutoIncrement, {
  inc_field: 'order_id',
  start_seq: 1000,
});

// Indexes for better performance
orderSchema.index({ order_id: 1 });
orderSchema.index({ 'customer.customer': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ order_date: -1 });
orderSchema.index({ 'products.vendor': 1 });
orderSchema.index({ is_paid: 1 });
orderSchema.index({ 'payment_details.payment_status': 1 });

// Virtual for total savings
orderSchema.virtual('total_savings').get(function () {
  if (!this.products) return 0;

  return (
    this.products.reduce((total, product) => {
      const regularPrice = product.regular_price || 0;
      const salePrice = product.sale_price || regularPrice;
      const savings = (regularPrice - salePrice) * product.quantity;
      return total + savings;
    }, 0) + (this.discount || 0)
  );
});

// Virtual for order summary
orderSchema.virtual('order_summary').get(function () {
  return {
    subtotal: this.sub_total,
    installation_fee: this.installation_details?.total_installation_fee || 0,
    delivery_charges: this.delivery_charges,
    discount: this.discount,
    tax: this.tax,
    total: this.total_amount,
    savings: this.total_savings,
  };
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
