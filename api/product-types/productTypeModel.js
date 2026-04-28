import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './productTypes_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const productTypeSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
productTypeSchema.index({ '$**': 'text' });

productTypeSchema.plugin(AutoIncrement, {
  inc_field: 'product type_id',
  start_seq: 1000,
});

const ProductType = mongoose.model('ProductType', productTypeSchema);

export default ProductType;
