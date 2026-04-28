import asyncHandler from "express-async-handler";
import Size from "./SizeModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all sizes
// @route   GET /api/sizes
// @access  Public
const getSizes = asyncHandler(async (req, res) => {
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
  const count = await Size.countDocuments({ ...searchParams });
  const sizes = await Size.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ sizes, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all sizes
// @route   GET /api/sizes/all
// @access  Public
const getAllSizes = asyncHandler(async (req, res) => {
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
  const sizes = await Size.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(sizes);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single size
// @route   GET /api/sizes/:id
// @access  Public
const getSizeById = asyncHandler(async (req, res) => {
  try {
  const size = await Size.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (size && size.published_status === "PUBLISHED") {
    res.json(size);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a size
// @route   DELETE /api/sizes/:id
// @access  Private/Admin
const deleteSize = asyncHandler(async (req, res) => {
  try {
  const size = await Size.findById(req.params.id);

  if (size) {
    await size.remove();
    res.json({ message: "Size removed" });
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a size
// @route   POST /api/sizes
// @access  Private/Admin
const createSize = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;  
    const size = new Size(data);
    const createdSize = await size.save();
    res.status(201).json(createdSize); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a size
// @route   PUT /api/sizes/:id
// @access  Private
const updateSize = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;    
  const data = await Size.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedSize = await data.save();
    res.json(updatedSize);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getSizes,
  getSizeById,
  deleteSize,
  createSize,
  updateSize,
  getAllSizes,
};
