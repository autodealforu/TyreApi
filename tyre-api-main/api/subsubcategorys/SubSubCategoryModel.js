import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./subsubcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const subsubcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

subsubcategorySchema.plugin(AutoIncrement, {
    inc_field: "subsubcategory_id",
    start_seq: 1000,
  });


const SubSubCategory = mongoose.model("SubSubCategory", subsubcategorySchema);

export default SubSubCategory;
