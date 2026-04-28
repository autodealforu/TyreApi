import mongoose from 'mongoose';

const alloyWidthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Aligning with TyreWidth: store name and width_type
    width_type: {
      type: String,
      required: true,
    },
    // Legacy/optional fields kept for backward compatibility
    widthValue: {
      type: Number,
      required: false,
    },
    unit: {
      type: String,
      required: false,
      default: 'inches',
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

const AlloyWidth = mongoose.model('AlloyWidth', alloyWidthSchema);
export default AlloyWidth;
