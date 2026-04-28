export const inputFields = {
  subject: {
    type: "string",
    required: true,
  },
  message: {
    type: "string",
    required: true,
  },
  order: {
    type: "related",
    required: true,
    model: "Order",
  },
  status: {
    type: "select",
    required: false,
    options: ["OPENED", "RESOLVED", "CLOSED"],
    default: "OPENED",
  },
};
