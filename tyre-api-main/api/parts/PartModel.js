import mongoose from 'mongoose';

const PartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  gst_tax_rate: {
    type: String,
  },
  gst_type: {
    type: String,
  },

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming there is a User model for vendors
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` before saving
PartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const PartModel = mongoose.model('Part', PartSchema);

export default PartModel;
