import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);

const userSchema = mongoose.Schema(
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
    address: [
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
    vendor: {
      vendor_id: {
        type: Number,
        required: false,
      },
      store_name: {
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
      bank_name: {
        type: String,
        required: false,
      },
      ifsc_code: {
        type: String,
        required: false,
      },
      account_number: {
        type: Number,
        required: false,
      },
      cancelled_cheque: {
        type: String,
        required: false,
      },

      pickup_address: [
        {
          pickup_address_id: {
            type: String,
            required: false,
          },
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
            required: true,
          },
          landmark: {
            type: String,
            required: false,
          },
          latitude: {
            type: Number,
            required: false,
          },
          longitude: {
            type: Number,
            required: false,
          },
          add_to_shiprocket: {
            type: Boolean,
            required: false,
            default: false,
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
    },
    role: {
      type: String,
      required: true,
      default: 'CUSTOMER',
      enum: ['CUSTOMER', 'SUPER ADMIN', 'VENDOR', 'FRANCHISE'],
    },
    franchise_state: [
      {
        type: String,
        required: false,
      },
    ],
    published_status: {
      type: String,
      required: true,
      default: 'PUBLISHED',
      enum: ['PUBLISHED', 'DRAFT'],
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
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.index({ '$**': 'text' });
userSchema.plugin(AutoIncrement, {
  inc_field: 'user_id',
  start_seq: 1,
});

const User = mongoose.model('User', userSchema);

export default User;
