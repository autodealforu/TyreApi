import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./testimonials_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const testimonialSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

testimonialSchema.plugin(AutoIncrement, {
    inc_field: "testimonial_id",
    start_seq: 1000,
  });


const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
