import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    // Service Basic Information
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [200, 'Service name cannot exceed 200 characters'],
    },
    serviceDescription: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [1000, 'Service description cannot exceed 1000 characters'],
    },
    serviceShortName: {
      type: String,
      required: [true, 'Service short name is required'],
      trim: true,
      maxlength: [50, 'Service short name cannot exceed 50 characters'],
    },

    // Tax Information
    gstTaxRate: {
      type: String,
      required: [true, 'GST tax rate is required'],
      enum: ['0', '5', '12', '18', '28'],
      default: '18',
    },
    gstType: {
      type: String,
      required: [true, 'GST type is required'],
      enum: ['CGST_SGST', 'IGST', 'EXEMPT', 'NIL_RATED'],
      default: 'CGST_SGST',
    },

    // Product Classification
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['HOUR', 'SERVICE', 'JOB', 'PIECE', 'KM', 'LITER'],
      default: 'SERVICE',
    },
    hsnCode: {
      type: String,
      required: [true, 'HSN code is required'],
      trim: true,
      maxlength: [20, 'HSN code cannot exceed 20 characters'],
      default: '99820000', // Services HSN code
    },
    hsnSubCode: {
      type: String,
      trim: true,
      maxlength: [20, 'HSN sub code cannot exceed 20 characters'],
    },

    // Service Specific Information
    warranty: {
      type: String,
      trim: true,
      maxlength: [500, 'Warranty information cannot exceed 500 characters'],
      default: 'Standard service warranty as per company policy',
    },
    serviceImage: {
      type: String,
      trim: true,
      default: '',
    },

    // Product Type Reference
    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductType',
      required: [true, 'Product type is required'],
    },

    // Service Category (could be added later for better organization)
    serviceCategory: {
      type: String,
      enum: [
        'MAINTENANCE',
        'REPAIR',
        'INSTALLATION',
        'INSPECTION',
        'CONSULTATION',
        'OTHER',
      ],
      default: 'MAINTENANCE',
    },

    // Duration and Complexity
    estimatedDuration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute'],
      max: [10080, 'Duration cannot exceed 1 week (10080 minutes)'],
    },
    complexityLevel: {
      type: String,
      enum: ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      default: 'BASIC',
    },

    // Status and Lifecycle
    published_status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'INACTIVE'],
      default: 'DRAFT',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Required Tools/Equipment (optional)
    requiredEquipment: [
      {
        type: String,
        trim: true,
      },
    ],

    // Prerequisites (optional)
    prerequisites: {
      type: String,
      trim: true,
      maxlength: [500, 'Prerequisites cannot exceed 500 characters'],
    },

    // Metadata
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
serviceSchema.index({ serviceName: 1 });
serviceSchema.index({ serviceShortName: 1 });
serviceSchema.index({ serviceCategory: 1 });
serviceSchema.index({ published_status: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ created_by: 1 });

// Virtual for full service display name
serviceSchema.virtual('displayName').get(function () {
  return `${this.serviceName} (${this.serviceShortName})`;
});

// Pre-save middleware
serviceSchema.pre('save', function (next) {
  // Auto-generate short name if not provided
  if (!this.serviceShortName && this.serviceName) {
    this.serviceShortName = this.serviceName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
  next();
});

// Static methods
serviceSchema.statics.findPublished = function () {
  return this.find({ published_status: 'PUBLISHED', isActive: true });
};

serviceSchema.statics.findByCategory = function (category) {
  return this.find({
    serviceCategory: category,
    published_status: 'PUBLISHED',
    isActive: true,
  });
};

const ServiceModel = mongoose.model('Service', serviceSchema);
export default ServiceModel;
