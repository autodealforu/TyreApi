import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);

const bulkSchema = mongoose.Schema(
  {
    file: {
      type: String,
      required: true,
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Productcollection',
    },
    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'SubCategory',
    },
    sub_sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'SubSubCategory',
    },
  },
  {
    timestamps: true,
  }
);

bulkSchema.plugin(AutoIncrement, {
  inc_field: 'bulk_id',
  start_seq: 1000,
});

const Bulk = mongoose.model('Bulk', bulkSchema);

export default Bulk;
