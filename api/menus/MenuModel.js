import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./menus_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const menuSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

menuSchema.plugin(AutoIncrement, {
    inc_field: "menu_id",
    start_seq: 1000,
  });


const Menu = mongoose.model("Menu", menuSchema);

export default Menu;
