import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./templates_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const templateSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

templateSchema.plugin(AutoIncrement, {
    inc_field: "template_id",
    start_seq: 1000,
  });


const Template = mongoose.model("Template", templateSchema);

export default Template;
