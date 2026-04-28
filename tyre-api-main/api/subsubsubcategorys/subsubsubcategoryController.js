import asyncHandler from "express-async-handler";
import SubSubSubCategory from "./SubSubSubCategoryModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all subsubsubcategorys
// @route   GET /api/subsubsubcategorys
// @access  Public
const getSubSubSubCategorys = asyncHandler(async (req, res) => {
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
  const count = await SubSubSubCategory.countDocuments({ ...searchParams });
  const subsubsubcategorys = await SubSubSubCategory.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ subsubsubcategorys, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all subsubsubcategorys
// @route   GET /api/subsubsubcategorys/all
// @access  Public
const getAllSubSubSubCategorys = asyncHandler(async (req, res) => {
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
  const subsubsubcategorys = await SubSubSubCategory.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(subsubsubcategorys);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single subsubsubcategory
// @route   GET /api/subsubsubcategorys/:id
// @access  Public
const getSubSubSubCategoryById = asyncHandler(async (req, res) => {
  try {
  const subsubsubcategory = await SubSubSubCategory.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (subsubsubcategory && subsubsubcategory.published_status === "PUBLISHED") {
    res.json(subsubsubcategory);
  } else {
    res.status(404);
    throw new Error("SubSubSubCategory not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a subsubsubcategory
// @route   DELETE /api/subsubsubcategorys/:id
// @access  Private/Admin
const deleteSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
  const subsubsubcategory = await SubSubSubCategory.findById(req.params.id);

  if (subsubsubcategory) {
    await subsubsubcategory.remove();
    res.json({ message: "SubSubSubCategory removed" });
  } else {
    res.status(404);
    throw new Error("SubSubSubCategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a subsubsubcategory
// @route   POST /api/subsubsubcategorys
// @access  Private/Admin
const createSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;  
    const subsubsubcategory = new SubSubSubCategory(data);
    const createdSubSubSubCategory = await subsubsubcategory.save();
    res.status(201).json(createdSubSubSubCategory); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a subsubsubcategory
// @route   PUT /api/subsubsubcategorys/:id
// @access  Private
const updateSubSubSubCategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;    
  const data = await SubSubSubCategory.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedSubSubSubCategory = await data.save();
    res.json(updatedSubSubSubCategory);
  } else {
    res.status(404);
    throw new Error("SubSubSubCategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getSubSubSubCategorys,
  getSubSubSubCategoryById,
  deleteSubSubSubCategory,
  createSubSubSubCategory,
  updateSubSubSubCategory,
  getAllSubSubSubCategorys,
};
