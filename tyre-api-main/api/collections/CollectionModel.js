import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./collections_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);

const collectionSchema = mongoose.Schema(
  {
    ...modalFields,
    dynamic_collection: {
      field: {
        type: String,
        required: false,
      },
      condition: {
        type: String,
        required: false,
      },
      value: {
        type: Number,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.plugin(AutoIncrement, {
  inc_field: "collection_id",
  start_seq: 1000,
});

const Collection = mongoose.model("Productcollection", collectionSchema);

export default Collection;
