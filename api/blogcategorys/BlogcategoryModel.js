import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./blogcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const blogcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

blogcategorySchema.plugin(AutoIncrement, {
    inc_field: "blogcategory_id",
    start_seq: 1000,
  });


const Blogcategory = mongoose.model("Blogcategory", blogcategorySchema);

export default Blogcategory;
