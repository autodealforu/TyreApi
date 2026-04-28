import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);

const vendorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    vendor_id: {
      type: Number,
      required: false,
    },
    store_name: {
      type: String,
      required: false,
    },
    store_slug: {
      type: String,
      required: false,
    },
    store_description: {
      type: String,
      required: false,
    },
    store_logo: {
      type: String,
      required: false,
    },
    gst_no: {
      type: String,
      required: false,
    },
    gst_certificate: {
      type: String,
      required: false,
    },
    pan_no: {
      type: String,
      required: false,
    },
    pan: {
      type: String,
      required: false,
    },
    adhaar_no: {
      type: String,
      required: false,
    },
    adhaar_certificate_front: {
      type: String,
      required: false,
    },
    adhaar_certificate_back: {
      type: String,
      required: false,
    },
    pickup_address: [
      {
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
          type: String,
          required: false,
        },
        landmark: {
          type: String,
          required: false,
        },
      },
    ],
    profile_status: {
      type: String,
      required: false,
      default: 'UNDER REVIEW',
      enum: ['UNDER REVIEW', 'APPROVED', 'REJECTED'],
    },
    store_active: {
      type: Boolean,
      required: false,
      default: false,
    },
    is_blocked: {
      type: Boolean,
      required: false,
      default: false,
    },

    is_verified: {
      type: Boolean,
      required: false,
      default: false,
    },
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
  },
  {
    timestamps: true,
  }
);

vendorSchema.plugin(AutoIncrement, {
  inc_field: 'vendor_id',
  start_seq: 1000,
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
