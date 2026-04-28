export const inputFields = {
  title: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: true,
  },
  position: { type: 'number', required: false, default: 0 },
  display_type: {
    type: 'select',
    required: false,
    default: 'IMAGE',
    options: [
      'COLLECTION',
      'COLLECTION PRODUCTS',
      'IMAGE',
      'GALLERY',
      'SLIDER',
      'TEXT',
    ],
  },
};
