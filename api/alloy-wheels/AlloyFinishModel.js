import mongoose from 'mongoose';

const alloyFinishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Simplified to match Tyre-like reference: only name
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

const AlloyFinish = mongoose.model('AlloyFinish', alloyFinishSchema);
export default AlloyFinish;
