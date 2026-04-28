import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./blogs_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);


const blogSchema = mongoose.Schema(
  modalFields,  
  {
    timestamps: true,
  }
);

blogSchema.plugin(AutoIncrement, {
    inc_field: "blog_id",
    start_seq: 1000,
  });


const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
