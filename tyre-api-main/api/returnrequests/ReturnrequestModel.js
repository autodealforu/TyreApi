import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./returnrequests_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);

const returnrequestSchema = mongoose.Schema(
  { ...modalFields, media: [{ type: String }] },
  {
    timestamps: true,
  }
);

returnrequestSchema.plugin(AutoIncrement, {
  inc_field: "returnrequest_id",
  start_seq: 1000,
});

const Returnrequest = mongoose.model("Returnrequest", returnrequestSchema);

export default Returnrequest;
