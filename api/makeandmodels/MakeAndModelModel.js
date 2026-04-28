import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './makeandmodels_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const makeModelSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});

makeModelSchema.plugin(AutoIncrement, {
  inc_field: 'makemodel_id',
  start_seq: 1000,
});

const MakeModel = mongoose.model('MakeModel', makeModelSchema);

export default MakeModel;
