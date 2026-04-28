import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./customers_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const customerSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

customerSchema.plugin(AutoIncrement, {
    inc_field: "customer_id",
    start_seq: 1000,
  });


const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
