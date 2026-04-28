export const inputFields = {
  name: {
    type: 'string',
    required: false,
  },
  banner_type: {
    type: 'string',
    required: false,
    default: 'image',
  },
  title: {
    type: 'string',
    required: false,
  },
  subtitle: {
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
  video: {
    type: 'string',
    required: false,
  },
  youtube_url: {
    type: 'string',
    required: false,
  },
};
