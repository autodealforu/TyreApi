export const inputFields = {
  notes: {
    type: 'string',
    required: true,
  },
  order: {
    type: 'related',
    required: false,
    model: 'Order',
  },
  user: {
    type: 'related',
    required: false,
    model: 'User',
  },
  is_read: {
    type: 'boolean',
    required: false,
    default: false,
  },
};
