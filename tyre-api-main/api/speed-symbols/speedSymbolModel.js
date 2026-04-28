import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './speedSymbols_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const speedSymbolSchema = mongoose.Schema(modalFields, {
  timestamps: true,
});
speedSymbolSchema.index({ '$**': 'text' });

speedSymbolSchema.plugin(AutoIncrement, {
  inc_field: 'speedSymbol_id',
  start_seq: 1000,
});

const SpeedSymbol = mongoose.model('SpeedSymbol', speedSymbolSchema);

export default SpeedSymbol;
