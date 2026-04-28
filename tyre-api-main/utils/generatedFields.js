import mongoose from "mongoose";
const generateFields = (inputFields) => {
  const newDataCheck = {};
  if (Object.keys(inputFields)) {
    Object.keys(inputFields).map((item, index) => {
      if (inputFields[item] && inputFields[item].type === "string") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: String,
            required: true,
          };
          if (inputFields[item].default) {
            newDataCheck[item]["default"] = inputFields[item].default;
          }
        } else {
          newDataCheck[item] = {
            type: String,
            required: false,
          };
          if (inputFields[item].default) {
            newDataCheck[item]["default"] = inputFields[item].default;
          }
        }
      }

      if (inputFields[item] && inputFields[item].type === "number") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: Number,
            required: true,
            default: inputFields[item].default ? inputFields[item].default : 0,
          };
        } else {
          newDataCheck[item] = {
            type: Number,
            required: false,
            default: inputFields[item].default ? inputFields[item].default : 0,
          };
        }
      }
      if (inputFields[item] && inputFields[item].type === "date") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: Date,
            required: true,
            // default: inputFields[item].default ? inputFields[item].default : 0,
          };
        } else {
          newDataCheck[item] = {
            type: Date,
            required: false,
            // default: inputFields[item].default ? inputFields[item].default : 0,
          };
        }
      }
      if (inputFields[item] && inputFields[item].type === "boolean") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: Boolean,
            required: true,
            default: inputFields[item].default
              ? inputFields[item].default
              : false,
          };
        } else {
          newDataCheck[item] = {
            type: Boolean,
            required: false,
            default: inputFields[item].default
              ? inputFields[item].default
              : false,
          };
        }
      }
      if (inputFields[item] && inputFields[item].type === "select") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: String,
            required: true,
            options: inputFields[item].options,
            default: inputFields[item].default ? inputFields[item].default : "",
          };
        } else {
          newDataCheck[item] = {
            type: String,
            required: false,
            options: inputFields[item].options,
            default: inputFields[item].default ? inputFields[item].default : "",
          };
        }
      }
      if (inputFields[item] && inputFields[item].type === "related") {
        if (inputFields[item].required) {
          newDataCheck[item] = {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: inputFields[item].model,
          };
        } else {
          newDataCheck[item] = {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: inputFields[item].model,
          };
        }
      }
      if (inputFields[item] && inputFields[item].type === "array") {
        if (inputFields[item] && inputFields[item].fields) {
          const arrayData = {};
          const arrayKeysData = inputFields[item].fields;
          if (Object.keys(arrayKeysData)) {
            Object.keys(arrayKeysData).map((sub_item, index) => {
              if (
                arrayKeysData[sub_item] &&
                arrayKeysData[sub_item].type === "string"
              ) {
                if (arrayKeysData[sub_item].required) {
                  arrayData[sub_item] = {
                    type: String,
                    required: true,
                  };
                  if (arrayKeysData[sub_item].default) {
                    arrayData[sub_item]["default"] =
                      arrayKeysData[sub_item].default;
                  }
                } else {
                  arrayData[sub_item] = {
                    type: String,
                    required: false,
                  };
                  if (arrayKeysData[sub_item].default) {
                    arrayData[sub_item]["default"] =
                      arrayKeysData[sub_item].default;
                  }
                }
              }

              if (
                arrayKeysData[sub_item] &&
                arrayKeysData[sub_item].type === "number"
              ) {
                if (arrayKeysData[sub_item].required) {
                  arrayData[sub_item] = {
                    type: Number,
                    required: true,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : 0,
                  };
                } else {
                  arrayData[item] = {
                    type: Number,
                    required: false,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : 0,
                  };
                }
              }
              if (
                arrayKeysData[sub_item] &&
                arrayKeysData[sub_item].type === "boolean"
              ) {
                if (arrayKeysData[sub_item].required) {
                  arrayData[sub_item] = {
                    type: Boolean,
                    required: true,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : false,
                  };
                } else {
                  arrayData[item] = {
                    type: Boolean,
                    required: false,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : false,
                  };
                }
              }
              if (
                arrayKeysData[sub_item] &&
                arrayKeysData[sub_item].type === "select"
              ) {
                if (arrayKeysData[sub_item].required) {
                  arrayData[sub_item] = {
                    type: String,
                    required: true,
                    options: arrayKeysData[sub_item].options,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : "",
                  };
                } else {
                  arrayData[sub_item] = {
                    type: String,
                    required: false,
                    options: arrayKeysData[sub_item].options,
                    default: arrayKeysData[sub_item].default
                      ? arrayKeysData[sub_item].default
                      : "",
                  };
                }
              }
              if (
                arrayKeysData[sub_item] &&
                arrayKeysData[sub_item].type === "related"
              ) {
                if (arrayKeysData[sub_item].required) {
                  arrayData[sub_item] = {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: arrayKeysData[sub_item].model,
                  };
                } else {
                  arrayData[sub_item] = {
                    type: mongoose.Schema.Types.ObjectId,
                    required: false,
                    ref: arrayKeysData[sub_item].model,
                  };
                }
              }
            });
          }
          newDataCheck[item] = [arrayData];
        }

        if (inputFields[item] && inputFields[item].type === "related") {
          if (inputFields[item].required) {
            newDataCheck[item] = {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
              ref: inputFields[item].model,
            };
          } else {
            newDataCheck[item] = {
              type: mongoose.Schema.Types.ObjectId,
              required: false,
              ref: inputFields[item].model,
            };
          }
        }
      }
    });
  }
  newDataCheck["meta_title"] = {
    type: String,
    required: false,
  };
  newDataCheck["meta_description"] = {
    type: String,
    required: false,
  };
  newDataCheck["created_by"] = {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "User",
  };
  newDataCheck["updated_by"] = {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "User",
  };
  newDataCheck["published_status"] = {
    type: String,
    required: false,
    enum: ["PUBLISHED", "DRAFT"],
    default: "PUBLISHED",
  };
  return newDataCheck;
};

export default generateFields;
