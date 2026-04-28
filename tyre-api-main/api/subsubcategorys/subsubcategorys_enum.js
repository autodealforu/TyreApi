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
