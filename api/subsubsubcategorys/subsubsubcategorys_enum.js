export const inputFields = {
  name: {
    type: 'string',
    required: true,
  },
  category: {
    type: 'related',
    required: true,
    model: 'Productcategory',
  },
  sub_category: {
    type: 'related',
    required: true,
    model: 'SubCategory',
  },
  sub_sub_category: {
    type: 'related',
    required: true,
    model: 'SubSubCategory',
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
  meta_title: {
    type: 'string',
    required: false,
  },
  meta_description: {
    type: 'string',
    required: false,
  },
};
