import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema(
  {
    makeModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MakeModel',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1886, // The year the first car was invented
    },
    vin: {
      type: String,
      required: false,
    },
    vehicle_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming there is a User model
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;
