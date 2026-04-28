import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./categorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const categorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

categorySchema.plugin(AutoIncrement, {
    inc_field: "category_id",
    start_seq: 1000,
  });


const Category = mongoose.model("Category", categorySchema);

export default Category;
