import asyncHandler from "express-async-handler";
import Menu from "./MenuModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all menus
// @route   GET /api/menus
// @access  Public
const getMenus = asyncHandler(async (req, res) => {
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
  const count = await Menu.countDocuments({ ...searchParams });
  const menus = await Menu.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ menus, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all menus
// @route   GET /api/menus/all
// @access  Public
const getAllMenus = asyncHandler(async (req, res) => {
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
  const menus = await Menu.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(menus);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single menu
// @route   GET /api/menus/:id
// @access  Public
const getMenuById = asyncHandler(async (req, res) => {
  try {
  const menu = await Menu.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (menu && menu.published_status === "PUBLISHED") {
    res.json(menu);
  } else {
    res.status(404);
    throw new Error("Menu not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a menu
// @route   DELETE /api/menus/:id
// @access  Private/Admin
const deleteMenu = asyncHandler(async (req, res) => {
  try {
  const menu = await Menu.findById(req.params.id);

  if (menu) {
    await menu.remove();
    res.json({ message: "Menu removed" });
  } else {
    res.status(404);
    throw new Error("Menu not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a menu
// @route   POST /api/menus
// @access  Private/Admin
const createMenu = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const menu = new Menu(data);
    const createdMenu = await menu.save();
    res.status(201).json(createdMenu); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a menu
// @route   PUT /api/menus/:id
// @access  Private
const updateMenu = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Menu.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedMenu = await data.save();
    res.json(updatedMenu);
  } else {
    res.status(404);
    throw new Error("Menu not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getMenus,
  getMenuById,
  deleteMenu,
  createMenu,
  updateMenu,
  getAllMenus,
};
