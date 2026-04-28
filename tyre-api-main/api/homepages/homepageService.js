import Product from '../products/ProductModel.js';
import User from '../users/UserModel.js';

const getTotalProductsByHomepage = async ({ homepage }) => {
  if (
    homepage.display_type === 'COLLECTION PRODUCTS' &&
    homepage.collection_product_component &&
    homepage.collection_product_component.product_collection._id
  ) {
    const collection_id =
      homepage.collection_product_component.product_collection._id;
    const vendors = await User.find({
      role: 'VENDOR',
      'vendor.profile_status': 'APPROVED',
    });
    const vendorIds = vendors.map((vendor) => vendor._id);
    const products = await Product.find(
      {
        collections: collection_id,
        featured: true,
        product_status: 'Active',
        vendor: { $in: vendorIds },
      },
      { description: 0 }
    )
      .limit(5)
      // .populate('vendor')
      // .populate('collections')
      // .populate('product_category')
      .populate({
        path: 'reviews',
        match: { approved: { $eq: true } },
      })
      .sort({ createdAt: -1 });
    return { ...homepage, products };
  } else {
    return homepage;
  }

  // const totalProducts = await Product.countDocuments({ vendor: vendor._id });

  // console.log('Inside ', totalProducts, { ...vendor, totalProducts });
};

export { getTotalProductsByHomepage };
