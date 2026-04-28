import asyncHandler from "express-async-handler";
import Blogcategory from "./BlogcategoryModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all blogcategorys
// @route   GET /api/blogcategorys
// @access  Public
const getBlogcategorys = asyncHandler(async (req, res) => {
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
  const count = await Blogcategory.countDocuments({ ...searchParams });
  const blogcategorys = await Blogcategory.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ blogcategorys, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all blogcategorys
// @route   GET /api/blogcategorys/all
// @access  Public
const getAllBlogcategorys = asyncHandler(async (req, res) => {
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
  const blogcategorys = await Blogcategory.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(blogcategorys);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single blogcategory
// @route   GET /api/blogcategorys/:id
// @access  Public
const getBlogcategoryById = asyncHandler(async (req, res) => {
  try {
  const blogcategory = await Blogcategory.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (blogcategory && blogcategory.published_status === "PUBLISHED") {
    res.json(blogcategory);
  } else {
    res.status(404);
    throw new Error("Blogcategory not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a blogcategory
// @route   DELETE /api/blogcategorys/:id
// @access  Private/Admin
const deleteBlogcategory = asyncHandler(async (req, res) => {
  try {
  const blogcategory = await Blogcategory.findById(req.params.id);

  if (blogcategory) {
    await blogcategory.remove();
    res.json({ message: "Blogcategory removed" });
  } else {
    res.status(404);
    throw new Error("Blogcategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a blogcategory
// @route   POST /api/blogcategorys
// @access  Private/Admin
const createBlogcategory = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const blogcategory = new Blogcategory(data);
    const createdBlogcategory = await blogcategory.save();
    res.status(201).json(createdBlogcategory); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a blogcategory
// @route   PUT /api/blogcategorys/:id
// @access  Private
const updateBlogcategory = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Blogcategory.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedBlogcategory = await data.save();
    res.json(updatedBlogcategory);
  } else {
    res.status(404);
    throw new Error("Blogcategory not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getBlogcategorys,
  getBlogcategoryById,
  deleteBlogcategory,
  createBlogcategory,
  updateBlogcategory,
  getAllBlogcategorys,
};
