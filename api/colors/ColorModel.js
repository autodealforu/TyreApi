import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./colors_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const colorSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

colorSchema.plugin(AutoIncrement, {
    inc_field: "color_id",
    start_seq: 1000,
  });


const Color = mongoose.model("Color", colorSchema);

export default Color;
