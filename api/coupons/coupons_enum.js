export const inputFields = {
  code: {
    type: "string",
    required: true,
    default: "",
    options: "",
    model: "",
  },
  min_cart_value: {
    type: "string",
    required: true,
    default: "",
    options: "",
    model: "",
  },
  max_discount: {
    type: "string",
    required: true,
    default: "",
    options: "",
    model: "",
  },
  discount_type: {
    type: "select",
    required: true,
    default: "FIXED",
    options: ["FIXED", "PERCENTAGE"],
    model: "",
  },
  discount: {
    type: "string",
    required: true,
    default: "",
    options: "",
    model: "",
  },
  product_collection: {
    type: "related",
    required: false,
    model: "Productcollection",
  },
  product_category: {
    type: "related",
    required: false,
    model: "Productcategory",
  },
};
