import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./banners_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const bannerSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

bannerSchema.plugin(AutoIncrement, {
    inc_field: "banner_id",
    start_seq: 1000,
  });


const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
