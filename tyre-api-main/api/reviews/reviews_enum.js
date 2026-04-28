export const inputFields = {
  name: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'string',
    required: false,
  },
  product: {
    type: 'related',
    required: true,
    model: 'Product',
  },
  ratings: {
    type: 'string',
    required: true,
  },
  message: {
    type: 'string',
    required: false,
  },

  approved: {
    type: 'boolean',
    required: false,
    default: false,
  },
};
