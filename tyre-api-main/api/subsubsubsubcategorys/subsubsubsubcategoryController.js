import asyncHandler from "express-async-handler";
import SubSubSubSubCategory from "./SubSubSubSubCategoryModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all subsubsubsubcategorys
// @route   GET /api/subsubsubsubcategorys
// @access  Public
const getSubSubSubSubCategorys = asyncHandler(async (req, res) => {
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
    if (req.query.term) {
      const searchQ = req.query.term;
      const newQData = {$text: {$search: searchQ}};
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
  const count = await SubSubSubSubCategory.countDocuments({ ...searchParams });
  const subsubsubsubcategorys = await SubSubSubSubCategory.find({ ...searchParams })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ subsubsubsubcategorys, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all subsubsubsubcategorys
// @route   GET /api/subsubsubsubcategorys/all
// @access  Public
const getAllSubSubSubSubCategorys = asyncHandler(async (req, res) => {
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
  const subsubsubsubcategorys = await SubSubSubSubCategory.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(subsubsubsubcategorys);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single subsubsubsubcategory
// @route   GET /api/subsubsubsubcategorys/:id
// @access  Public
const getSubSubSubSubCategoryById = asyncHandler(async (req, res) => {
  try {
  const subsubsubsubcategory = await SubSubSubSubCategory.findById(req.params.id)

  if (subsubsubsubcategory && subsubsubsubcategory.published_status === "PUBLISHED") {
    res.json(subsubsubsubcategory);
  } else {
    res.status(404);
    throw new Error("SubSubSubSubCategory not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Fetch single subsubsubsubcategory
// @route   GET /api/subsubsubsubcategorys/:slug
// @access  Public
const getSubSubSubSubCategoryBySlug = asyncHandler(async (req, res) => {
  try {
    const subsubsubsubcategory = await SubSubSubSubCategory.findOne({ slug: req.params.slug })
    res.json(subsubsubsubcategory);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Delete a subsubsubsubcategory
// @route   DELETE /api/subsubsubsubcategorys/:id
// @access  Private/Admin
const deleteSubSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
  const subsubsubsubcategory = await SubSubSubSubCategory.findById(req.params.id);

  if (subsubsubsubcategory) {
    await subsubsubsubcategory.remove();
    res.json({ message: "SubSubSubSubCategory removed" });
  } else {
    res.status(404);
    throw new Error("SubSubSubSubCategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a subsubsubsubcategory
// @route   POST /api/subsubsubsubcategorys
// @access  Private/Admin
const createSubSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id;      
    }
    const subsubsubsubcategory = new SubSubSubSubCategory(data);
    const createdSubSubSubSubCategory = await subsubsubsubcategory.save();
    res.status(201).json(createdSubSubSubSubCategory); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a subsubsubsubcategory
// @route   PUT /api/subsubsubsubcategorys/:id
// @access  Private
const updateSubSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
  const data = await SubSubSubSubCategory.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedSubSubSubSubCategory = await data.save();
    res.json(updatedSubSubSubSubCategory);
  } else {
    res.status(404);
    throw new Error("SubSubSubSubCategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getSubSubSubSubCategorys,
  getSubSubSubSubCategoryById,
  getSubSubSubSubCategoryBySlug,
  deleteSubSubSubSubCategory,
  createSubSubSubSubCategory,
  updateSubSubSubSubCategory,
  getAllSubSubSubSubCategorys,
};
