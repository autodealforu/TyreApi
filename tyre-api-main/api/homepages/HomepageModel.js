import mongoose from "mongoose";
import AutoIncrementField from "mongoose-sequence";
const AutoIncrement = AutoIncrementField(mongoose);
import { inputFields } from "./homepages_enum.js";
import generateFields from "../../utils/generatedFields.js";
const modalFields = generateFields(inputFields);

const homepageSchema = mongoose.Schema(
  {
    ...modalFields,
    collections_component: {
      product_collections: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "Productcollection",
        },
      ],
    },
    collection_product_component: {
      product_collection: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Productcollection",
      },
    },
    image_component: {
      image: {
        type: String,
        required: false,
      },
      link: { type: String, required: false },
    },
    gallery_component: [
      {
        image: {
          type: String,
          required: false,
        },
        link: { type: String, required: false },
      },
    ],
    slider_component: [
      {
        image: {
          type: String,
          required: false,
        },
        link: { type: String, required: false },
      },
    ],
    text_component: [
      {
        title: {
          type: String,
          required: false,
        },
        image: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
        link: { type: String, required: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

homepageSchema.plugin(AutoIncrement, {
  inc_field: "homepage_id",
  start_seq: 1000,
});

const Homepage = mongoose.model("Homepage", homepageSchema);

export default Homepage;
