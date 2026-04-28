import { combineObjects } from './CombineObject.js';

export const VariationAttrs = ({ sizes, colors }) => {
  const variation_attrs = [];

  if (sizes?.length > 0) {
    const option = {};
    option.label = 'Size';
    option.options = [];
    sizes.forEach((size) => {
      option.options.push({ value: size });
    });
    variation_attrs.push(option);
  }
  if (colors?.length > 0) {
    const option = {};
    option.label = 'Color';
    option.options = [];
    colors.forEach((color) => {
      option.options.push({ value: color });
    });
    variation_attrs.push(option);
  }
  return variation_attrs;
};

export const VariationTable = ({ variation_attrs, data }) => {
  console.log('Data', data);
  if (variation_attrs) {
    let freshArrayToIterate = variation_attrs.map((item) => {
      let newObjectValues = [];
      item.options.map((sub_item) => {
        let someObject = {};
        someObject[item.label] = sub_item.value;
        newObjectValues.push(someObject);
      });
      return newObjectValues;
    });
    let newArrayToCheck = [];
    freshArrayToIterate.map((item) => {
      newArrayToCheck.push(item);
    });
    const freshArrayToObject = combineObjects(newArrayToCheck);
    console.log('Somnehting', freshArrayToObject);
    let newArrayToAdd = freshArrayToObject.map((item, options_index) => {
      const keys = Object.keys(item);
      console.log(keys);
      let options = [];
      keys.map((key) => {
        let someKey = {
          label: key,
          value: item[key],
        };
        options.push(someKey);
      });
      item.regular_price = data.regular_price;
      item.sale_price = data.sale_price;
      item.options = options;
      item.in_stock = true;
      item.stock = 100;
      const color_index = data.colors?.findIndex(
        (color) => color === item.Color
      );
      console.log('color_index', color_index);
      item.media =
        data.colors &&
        color_index + 1 &&
        data[`variation_${color_index + 1}_images`]
          ? data[`variation_${color_index + 1}_images`]
          : [];
      return item;
    });
    // console.log('newArrayToAdd', newArrayToAdd);
    return newArrayToAdd;
  }
};
