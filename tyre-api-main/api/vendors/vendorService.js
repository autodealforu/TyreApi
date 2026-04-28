import Product from '../products/ProductModel.js';

const getTotalProductsByVendor = async ({ vendor }) => {
  const totalProducts = await Product.countDocuments({ vendor: vendor._id });

  console.log('Inside ', totalProducts, { ...vendor, totalProducts });

  return { ...vendor, totalProducts };
};

export { getTotalProductsByVendor };
