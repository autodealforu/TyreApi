import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./subsubsubsubcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const subsubsubsubcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);
subsubsubsubcategorySchema.index({'$**': 'text'});

subsubsubsubcategorySchema.plugin(AutoIncrement, {
    inc_field: "subsubsubsubcategory_id",
    start_seq: 1000,
  });


const SubSubSubSubCategory = mongoose.model("SubSubSubSubCategory", subsubsubsubcategorySchema);

export default SubSubSubSubCategory;
