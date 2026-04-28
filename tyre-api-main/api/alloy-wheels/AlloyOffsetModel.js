import mongoose from 'mongoose';

const alloyOffsetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Simplified to match Tyre: only name
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

const AlloyOffset = mongoose.model('AlloyOffset', alloyOffsetSchema);
export default AlloyOffset;
