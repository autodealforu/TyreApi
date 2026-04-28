import mongoose from 'mongoose';

const alloyDiameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Align with Tyre Rim Diameter: only store name
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

const AlloyDiameter = mongoose.model('AlloyDiameter', alloyDiameterSchema);
export default AlloyDiameter;
