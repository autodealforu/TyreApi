import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./brands_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const brandSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

brandSchema.plugin(AutoIncrement, {
    inc_field: "brand_id",
    start_seq: 1000,
  });


const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
