import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './loadIndexes_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const loadIndexSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
loadIndexSchema.index({ '$**': 'text' });

loadIndexSchema.plugin(AutoIncrement, {
  inc_field: 'loadIndex_id',
  start_seq: 1000,
});

const LoadIndex = mongoose.model('LoadIndex', loadIndexSchema);

export default LoadIndex;
