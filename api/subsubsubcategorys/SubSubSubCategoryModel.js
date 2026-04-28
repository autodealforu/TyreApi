import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./subsubsubcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const subsubsubcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

subsubsubcategorySchema.plugin(AutoIncrement, {
    inc_field: "subsubsubcategory_id",
    start_seq: 1000,
  });


const SubSubSubCategory = mongoose.model("SubSubSubCategory", subsubsubcategorySchema);

export default SubSubSubCategory;
