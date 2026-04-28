import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './threadPatterns_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const threadPatternSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
threadPatternSchema.index({ '$**': 'text' });

threadPatternSchema.plugin(AutoIncrement, {
  inc_field: 'threadpattern_id',
  start_seq: 1000,
});

const ThreadPattern = mongoose.model('ThreadPattern', threadPatternSchema);

export default ThreadPattern;
