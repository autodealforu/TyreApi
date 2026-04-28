import mongoose from 'mongoose';

const alloyPCDSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Simplified to match Tyre reference style: only name
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

const AlloyPCD = mongoose.model('AlloyPCD', alloyPCDSchema);
export default AlloyPCD;
