import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./carts_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const cartSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

cartSchema.plugin(AutoIncrement, {
    inc_field: "cart_id",
    start_seq: 1000,
  });


const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
