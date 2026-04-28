import asyncHandler from "express-async-handler";
import Color from "./ColorModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all colors
// @route   GET /api/colors
// @access  Public
const getColors = asyncHandler(async (req, res) => {
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
  const count = await Color.countDocuments({ ...searchParams });
  const colors = await Color.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ colors, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all colors
// @route   GET /api/colors/all
// @access  Public
const getAllColors = asyncHandler(async (req, res) => {
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
  const colors = await Color.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(colors);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single color
// @route   GET /api/colors/:id
// @access  Public
const getColorById = asyncHandler(async (req, res) => {
  try {
  const color = await Color.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (color && color.published_status === "PUBLISHED") {
    res.json(color);
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a color
// @route   DELETE /api/colors/:id
// @access  Private/Admin
const deleteColor = asyncHandler(async (req, res) => {
  try {
  const color = await Color.findById(req.params.id);

  if (color) {
    await color.remove();
    res.json({ message: "Color removed" });
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a color
// @route   POST /api/colors
// @access  Private/Admin
const createColor = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;  
    const color = new Color(data);
    const createdColor = await color.save();
    res.status(201).json(createdColor); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a color
// @route   PUT /api/colors/:id
// @access  Private
const updateColor = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;    
  const data = await Color.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedColor = await data.save();
    res.json(updatedColor);
  } else {
    res.status(404);
    throw new Error("Color not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getColors,
  getColorById,
  deleteColor,
  createColor,
  updateColor,
  getAllColors,
};
