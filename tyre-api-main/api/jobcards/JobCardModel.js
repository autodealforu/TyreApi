import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';

const AutoIncrement = AutoIncrementField(mongoose);

const JobCardSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job_card_number: {
      type: Number,
      unique: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    service_type: {
      type: String,
      enum: ['Maintenance', 'Repair', 'Inspection'],
      required: false,
    },
    service_description: {
      type: String,
      required: false,
    },
    service_date: {
      type: Date,
      required: false,
    },
    service_status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    service_notes: {
      type: String,
    },
    service_technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
    },
    services_used: [
      {
        service_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        service_name: {
          type: String,
        },
        service_discount: {
          type: Number,
        },
        service_discount_type: {
          type: String,
          enum: ['FLAT', 'PERCENTAGE'],
        },
        service_tax: {
          type: Number,
        },
        tax_type: {
          type: String,
        },
        service_quantity: {
          type: Number,
        },
        service_cost: {
          type: Number,
        },
        service_total_cost: {
          type: Number,
        },
      },
    ],
    products_used: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        product_category: {
          type: String,
          enum: ['TYRE', 'ALLOY_WHEEL', 'SERVICE'],
        },
        product_name: {
          type: String,
        },
        product_cost: {
          type: Number,
        },
        product_quantity: {
          type: Number,
        },
        product_total_cost: {
          type: Number,
        },
        product_discount: {
          type: Number,
        },
        product_discount_type: {
          type: String,
          enum: ['FLAT', 'PERCENTAGE'],
        },
        product_tax: {
          type: Number,
        },
        tax_type: {
          type: String,
        },
      },
    ],

    service_parts_used: [
      {
        part_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Part',
        },
        part_name: {
          type: String,
        },
        part_cost: {
          type: Number,
        },
        part_quantity: {
          type: Number,
        },
        part_total_cost: {
          type: Number,
        },
        part_discount: {
          type: Number,
        },
        part_discount_type: {
          type: String,
          enum: ['FLAT', 'PERCENTAGE'],
        },
        part_tax: {
          type: Number,
        },
        tax_type: {
          type: String,
        },
      },
    ],
    service_labor_cost: {
      type: Number,
      required: false,
    },
    service_total_cost: {
      type: Number,
      required: false,
      get: (v) => (v != null ? parseFloat(v.toFixed(2)) : v),
      set: (v) => (v != null ? parseFloat(parseFloat(v).toFixed(2)) : v),
    },
    service_payment_status: {
      type: String,
      enum: ['Paid', 'Unpaid'],
      default: 'Unpaid',
    },
    service_payment_method: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI'],
    },
    service_payment_date: {
      type: Date,
    },

    service_feedback: {
      type: String,
    },
    service_rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    service_images: [
      {
        image_url: {
          type: String,
        },
        image_description: {
          type: String,
        },
      },
    ],
    service_documents: [
      {
        document_url: {
          type: String,
        },
        document_description: {
          type: String,
        },
      },
    ],

    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },

    form_type: {
      type: [String],
      enum: ['CLMRKC', 'CLMTELI', 'WORKC', 'WOTELI', 'SSRkc', 'SSTeli', 'Lead'],
      required: false,
    },
    odometer_reading: {
      type: Number,
      required: false,
      min: 0,
    },
    next_service_due_odometer_reading: {
      type: Number,
      default: 5000,
      min: 0,
    },

    brake_pad_status: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: false,
    },

    check_list: {
      type: [String],
      enum: [
        'मैंने सभी नट्स और व्हील कैप्स/ सेंटर कैप चेक कर लिए हैं और सब बराबर है !',
        'गाडी के टूल बॉक्स गाडी में सही सलामत रख दिए हैं !',
        'गाडी की स्टेपनी भी चेक कर के स्टेपनी में वापस रख दी है !',
        'कस्टमर की गाडी की टेस्ट ड्राइव करके कस्टमर को गाडी की चाबी सौंप दी गयी है !',
        'कस्टमर के पुराने टायर वापस कस्टमर की गाडी में रखवा दिए हैं या फिर उसे बिकवा कर उसके पैसे कस्टमर को दिलवा दिए गए हैं',
      ],
      required: false,
    },
    terms_and_conditions_accepted: {
      type: Boolean,
      required: false,
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Add auto-increment to job_card_number
JobCardSchema.plugin(AutoIncrement, { inc_field: 'job_card_number' });

const JobCardModel = mongoose.model('JobCard', JobCardSchema);

export default JobCardModel;
