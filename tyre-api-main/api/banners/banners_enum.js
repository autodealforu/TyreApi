export const inputFields = {
  name: {
    type: 'string',
    required: false,
  },
  product_collection: {
    type: 'related',
    required: false,
    model: 'Productcollection',
  },
  image: {
    type: 'string',
    required: false,
  },
  mobile_banner: {
    type: 'string',
    required: false,
  },
};
