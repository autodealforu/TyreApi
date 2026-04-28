import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./sizes_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const sizeSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

sizeSchema.plugin(AutoIncrement, {
    inc_field: "size_id",
    start_seq: 1000,
  });


const Size = mongoose.model("Size", sizeSchema);

export default Size;
