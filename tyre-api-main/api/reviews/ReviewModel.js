import mongoose from 'mongoose';
import AutoIncrementField from 'mongoose-sequence';
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from './reviews_enum.js';
import generateFields from '../../utils/generatedFields.js';
const modalFields = generateFields(inputFields);

const reviewSchema = mongoose.Schema(
  {
    ...modalFields,
    media: [{ type: String }],
    published_date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

reviewSchema.plugin(AutoIncrement, {
  inc_field: 'review_id',
  start_seq: 1000,
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
