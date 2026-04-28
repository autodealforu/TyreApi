import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./newsletters_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const newsletterSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

newsletterSchema.plugin(AutoIncrement, {
    inc_field: "newsletter_id",
    start_seq: 1000,
  });


const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
