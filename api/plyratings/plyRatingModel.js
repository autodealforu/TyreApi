import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './plyRatings_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const plyratingSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
plyratingSchema.index({ '$**': 'text' });

plyratingSchema.plugin(AutoIncrement, {
  inc_field: 'plyrating_id',
  start_seq: 1000,
});

const PlyRating = mongoose.model('PlyRating', plyratingSchema);

export default PlyRating;
