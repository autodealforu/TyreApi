import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./subcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const subcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

subcategorySchema.plugin(AutoIncrement, {
    inc_field: "subcategory_id",
    start_seq: 1000,
  });


const SubCategory = mongoose.model("SubCategory", subcategorySchema);

export default SubCategory;
