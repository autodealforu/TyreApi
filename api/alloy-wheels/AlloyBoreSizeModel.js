import mongoose from 'mongoose';

const alloyBoreSizeSchema = new mongoose.Schema(
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

const AlloyBoreSize = mongoose.model('AlloyBoreSize', alloyBoreSizeSchema);
export default AlloyBoreSize;
