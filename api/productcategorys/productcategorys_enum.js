export const inputFields = {
  name: {
    type: 'string',
    required: true,
  },
  product_collection: {
    type: 'related',
    required: false,
    model: 'Productcollection',
  },
  slug: {
    type: 'string',
    required: true,
  },
  image: {
    type: 'string',
    required: false,
  },
  commission: {
    type: 'number',
    required: true,
  },
  published_date: {
    type: 'date',
    required: false,
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
};
