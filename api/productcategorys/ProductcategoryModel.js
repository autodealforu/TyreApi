import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./productcategorys_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const productcategorySchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

productcategorySchema.plugin(AutoIncrement, {
    inc_field: "productcategory_id",
    start_seq: 1000,
  });


const Productcategory = mongoose.model("Productcategory", productcategorySchema);

export default Productcategory;
