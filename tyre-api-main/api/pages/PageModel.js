import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./pages_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const pageSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

pageSchema.plugin(AutoIncrement, {
    inc_field: "page_id",
    start_seq: 1000,
  });


const Page = mongoose.model("Page", pageSchema);

export default Page;
