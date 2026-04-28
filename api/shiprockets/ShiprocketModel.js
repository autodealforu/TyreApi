import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./shiprockets_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const shiprocketSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

shiprocketSchema.plugin(AutoIncrement, {
    inc_field: "shiprocket_id",
    start_seq: 1000,
  });


const Shiprocket = mongoose.model("Shiprocket", shiprocketSchema);

export default Shiprocket;
