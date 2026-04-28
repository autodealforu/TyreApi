import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './aspectRatios_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const aspectRatioSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
aspectRatioSchema.index({ '$**': 'text' });

aspectRatioSchema.plugin(AutoIncrement, {
  inc_field: 'aspectRatio_id',
  start_seq: 1000,
});

const AspectRatio = mongoose.model('AspectRatio', aspectRatioSchema);

export default AspectRatio;
