import mongoose from 'mongoose';

const alloyWheelSchema = new mongoose.Schema(
  {
    // Alloy Wheel Specific Fields
    alloyDiameterInches: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyDiameter',
      required: true,
    },
    alloyWidth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyWidth',
      required: true,
    },
    alloyPCD: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyPCD',
      required: true,
    },
    alloyOffset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyOffset',
      required: true,
    },
    alloyBoreSizeMM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyBoreSize',
      required: true,
    },
    alloyBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    alloyDesignName: {
      type: String,
      required: true,
    },
    alloyFinish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlloyFinish',
      required: true,
    },

    // General Product Fields (same as tyre)
    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductType',
    },
    gstTaxRate: {
      type: String,
    },
    gstTax: {
      type: String,
    },
    unit: {
      type: String,
    },
    broadCategory: {
      type: String,
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    hsnCode: {
      type: String,
    },
    hsnSubCode: {
      type: String,
    },
    warranty: {
      type: String,
    },
    productImages: [
      {
        type: String,
      },
    ],
    productDescription: {
      type: String,
    },
    productWarrantyPolicy: {
      type: String,
    },
    grossWeight: {
      type: String,
    },
    volumetricWeight: {
      type: String,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    published_status: {
      type: String,
      enum: ['PUBLISHED', 'UNPUBLISHED'],
      default: 'PUBLISHED',
    },
  },
  {
    timestamps: true,
  }
);

const AlloyWheelModel = mongoose.model('AlloyWheel', alloyWheelSchema);
export default AlloyWheelModel;
