export const inputFields = {
  name: {
    type: 'string',
  },
  // Alloy Wheel Specific Fields
  alloyDiameterInches: {
    type: 'string',
    required: true,
  },
  alloyWidth: {
    type: 'string',
    required: true,
  },
  alloyPCD: {
    type: 'string',
    required: true,
  },
  alloyOffset: {
    type: 'string',
    required: true,
  },
  alloyBoreSizeMM: {
    type: 'string',
    required: true,
  },
  alloyBrand: {
    type: 'string',
    required: true,
  },
  alloyDesignName: {
    type: 'string',
    required: true,
  },
  alloyFinish: {
    type: 'string',
    required: true,
  },

  // General Product Fields (same as tyre)
  productType: {
    type: 'string',
  },
  gstTaxRate: {
    type: 'string',
  },
  gstTax: {
    type: 'string',
  },
  unit: {
    type: 'string',
  },
  broadCategory: {
    type: 'string',
  },
  category: {
    type: 'string',
  },
  subCategory: {
    type: 'string',
  },
  hsnCode: {
    type: 'string',
  },
  hsnSubCode: {
    type: 'string',
  },
  warranty: {
    type: 'string',
  },
  productImages: {
    type: 'array',
  },
  productDescription: {
    type: 'string',
  },
  productWarrantyPolicy: {
    type: 'string',
  },
  grossWeight: {
    type: 'string',
  },
  volumetricWeight: {
    type: 'string',
  },
};
