import asyncHandler from "express-async-handler";
import Brand from "./BrandModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams["published_status"] = "PUBLISHED";
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: "i",
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
  const count = await Brand.countDocuments({ ...searchParams });
  const brands = await Brand.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ brands, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all brands
// @route   GET /api/brands/all
// @access  Public
const getAllBrands = asyncHandler(async (req, res) => {
  try {
  const page = Number(req.query.pageNumber) || 1;
  let searchParams = {};
  searchParams["published_status"] = "PUBLISHED";
  if (req.query.term && req.query.value) {
    // searchParams[req.query.term] = req.query.value;
    searchParams[req.query.term] = {
      $regex: req.query.value,
      $options: "i",
    };
  }
  const brands = await Brand.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(brands);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single brand
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
  try {
  const brand = await Brand.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (brand && brand.published_status === "PUBLISHED") {
    res.json(brand);
  } else {
    res.status(404);
    throw new Error("Brand not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  try {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    await brand.remove();
    res.json({ message: "Brand removed" });
  } else {
    res.status(404);
    throw new Error("Brand not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;  
    const brand = new Brand(data);
    const createdBrand = await brand.save();
    res.status(201).json(createdBrand); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private
const updateBrand = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;    
  const data = await Brand.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedBrand = await data.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error("Brand not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getBrands,
  getBrandById,
  deleteBrand,
  createBrand,
  updateBrand,
  getAllBrands,
};
