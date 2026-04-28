import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./contacts_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const contactSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

contactSchema.plugin(AutoIncrement, {
    inc_field: "contact_id",
    start_seq: 1000,
  });


const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
