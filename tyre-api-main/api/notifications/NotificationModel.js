import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./notifications_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const notificationSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

notificationSchema.plugin(AutoIncrement, {
    inc_field: "notification_id",
    start_seq: 1000,
  });


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
