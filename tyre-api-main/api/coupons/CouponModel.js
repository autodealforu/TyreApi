import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./coupons_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const couponSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

couponSchema.plugin(AutoIncrement, {
    inc_field: "coupon_id",
    start_seq: 1000,
  });


const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
