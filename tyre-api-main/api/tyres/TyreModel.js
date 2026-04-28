import mongoose from 'mongoose';

const tyreModelSchema = new mongoose.Schema(
  {
    rimDiameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RimDiameter',
      required: true,
    },
    tyreWidthType: {
      type: String,
      required: true,
    },
    tyreWidth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TyreWidth',
      required: true,
    },
    aspectRatio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AspectRatio',
    },
    loadIndex: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoadIndex',
    },
    speedSymbol: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpeedSymbol',
    },
    construction: {
      type: String,
    },
    plyRating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlyRating',
    },
    productBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    productThreadPattern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreadPattern',
    },
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
const TyreModel =
  mongoose.models.TyreModel || mongoose.model('TyreModel', tyreModelSchema);
export default TyreModel;
