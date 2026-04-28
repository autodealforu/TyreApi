import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
// import { inputFields } from "./products_enum.js";
// import generateFields from "../../utils/generatedFields.js";
// const modalFields = generateFields(inputFields);

const productSchema = mongoose.Schema(
  {
    product_status: {
      type: String,
      required: false,
      default: 'Pending',
    },

    // Product Type Discriminator
    product_category: {
      type: String,
      required: true,
      enum: ['TYRE', 'ALLOY_WHEEL', 'SERVICE'],
    },

    // References to different product types
    tyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TyreModel',
      required: function () {
        return this.product_category === 'TYRE';
      },
    },
    alloy_wheel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyWheel',
      required: function () {
        return this.product_category === 'ALLOY_WHEEL';
      },
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: function () {
        return this.product_category === 'SERVICE';
      },
    },

    // Unified pricing structure (works for all product types)
    cost_price: {
      type: Number,
      required: true,
    },
    mrp_price: {
      type: Number,
      required: false,
      default: 0,
    },
    rcp_price: {
      type: Number,
      required: false,
      default: 0,
    },
    auto_deal_price: {
      type: Number,
      required: false,
      default: 0,
    },

    // Legacy fields for backward compatibility
    tyre_cost: {
      type: Number,
      required: false,
    },
    tyre_price_mrp: {
      type: Number,
      required: false,
      default: 0,
    },
    tyre_price_rcp: {
      type: Number,
      required: false,
      default: 0,
    },
    tyre_price_auto_deal: {
      type: Number,
      required: false,
      default: 0,
    },

    in_stock: {
      type: Boolean,
      required: false,
      default: false,
    },
    stock: {
      type: Number,
      required: false,
      default: 100,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },

    published_date: {
      type: Date,
      required: false,
      default: Date.now,
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

// Pre-save middleware to handle unified pricing
productSchema.pre('save', function (next) {
  // For backward compatibility, sync legacy tyre pricing with unified pricing
  if (this.product_category === 'TYRE') {
    if (this.tyre_cost && !this.cost_price) this.cost_price = this.tyre_cost;
    if (this.tyre_price_mrp && !this.mrp_price)
      this.mrp_price = this.tyre_price_mrp;
    if (this.tyre_price_rcp && !this.rcp_price)
      this.rcp_price = this.tyre_price_rcp;
    if (this.tyre_price_auto_deal && !this.auto_deal_price)
      this.auto_deal_price = this.tyre_price_auto_deal;

    // Keep legacy fields in sync
    this.tyre_cost = this.cost_price;
    this.tyre_price_mrp = this.mrp_price;
    this.tyre_price_rcp = this.rcp_price;
    this.tyre_price_auto_deal = this.auto_deal_price;
  }
  next();
});

// Virtual to get the main product reference
productSchema.virtual('main_product').get(function () {
  switch (this.product_category) {
    case 'TYRE':
      return this.tyre;
    case 'ALLOY_WHEEL':
      return this.alloy_wheel;
    case 'SERVICE':
      return this.service;
    default:
      return null;
  }
});

// Method to get populated product details
productSchema.methods.getPopulatedProduct = async function () {
  switch (this.product_category) {
    case 'TYRE':
      return await this.populate('tyre');
    case 'ALLOY_WHEEL':
      return await this.populate('alloy_wheel');
    case 'SERVICE':
      return await this.populate('service');
    default:
      return this;
  }
};

// Static method to create product with category
productSchema.statics.createWithCategory = function (
  category,
  productData,
  pricingData
) {
  const productDoc = {
    product_category: category.toUpperCase(),
    ...pricingData,
    ...productData,
  };

  // Set the appropriate reference field
  switch (category.toUpperCase()) {
    case 'TYRE':
      productDoc.tyre = productData.productId;
      break;
    case 'ALLOY_WHEEL':
      productDoc.alloy_wheel = productData.productId;
      break;
    case 'SERVICE':
      productDoc.service = productData.productId;
      break;
  }

  return new this(productDoc);
};

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

// Only add auto-increment plugin if the model doesn't exist
let Product;
if (mongoose.models.Product) {
  Product = mongoose.models.Product;
} else {
  productSchema.plugin(AutoIncrement, {
    inc_field: 'product_id',
    start_seq: 1000,
  });
  Product = mongoose.model('Product', productSchema);
}

export default Product;
