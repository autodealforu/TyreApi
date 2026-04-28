import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './tyreWidths_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const tyreWidthSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
tyreWidthSchema.index({ '$**': 'text' });

tyreWidthSchema.plugin(AutoIncrement, {
  inc_field: 'tyreWidth_id',
  start_seq: 1000,
});

const TyreWidth = mongoose.model('TyreWidth', tyreWidthSchema);

export default TyreWidth;
