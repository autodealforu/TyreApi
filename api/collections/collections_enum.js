export const inputFields = {
  name: {
    type: 'string',
    required: true,
  },
  image: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },

  parent_collection: {
    type: 'related',
    required: false,
    model: 'Productcollection',
  },
  meta_title: {
    type: 'string',
    required: false,
  },
  meta_description: {
    type: 'string',
    required: false,
  },
  meta_keywords: {
    type: 'string',
    required: false,
  },
  slug: {
    type: 'string',
    required: false,
  },
  is_dynamic_collection: {
    type: 'boolean',
    required: false,
    default: false,
  },
};
