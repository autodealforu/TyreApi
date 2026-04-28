import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './rimDiameters_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const rimDiameterSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
rimDiameterSchema.index({ '$**': 'text' });

rimDiameterSchema.plugin(AutoIncrement, {
  inc_field: 'rimDiameter_id',
  start_seq: 1000,
});

const RimDiameter = mongoose.model('RimDiameter', rimDiameterSchema);

export default RimDiameter;
