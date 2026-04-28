import mongoose from 'mongoose';

const TechnicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: false,
    trim: true,
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
});

const Technician = mongoose.model('Technician', TechnicianSchema);

export default Technician;
