import asyncHandler from "express-async-handler";
import Cart from "./CartModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all carts
// @route   GET /api/carts
// @access  Public
const getCarts = asyncHandler(async (req, res) => {
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
  const count = await Cart.countDocuments({ ...searchParams });
  const carts = await Cart.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ carts, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all carts
// @route   GET /api/carts/all
// @access  Public
const getAllCarts = asyncHandler(async (req, res) => {
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
  const carts = await Cart.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(carts);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single cart
// @route   GET /api/carts/:id
// @access  Public
const getCartById = asyncHandler(async (req, res) => {
  try {
  const cart = await Cart.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (cart && cart.published_status === "PUBLISHED") {
    res.json(cart);
  } else {
    res.status(404);
    throw new Error("Cart not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a cart
// @route   DELETE /api/carts/:id
// @access  Private/Admin
const deleteCart = asyncHandler(async (req, res) => {
  try {
  const cart = await Cart.findById(req.params.id);

  if (cart) {
    await cart.remove();
    res.json({ message: "Cart removed" });
  } else {
    res.status(404);
    throw new Error("Cart not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a cart
// @route   POST /api/carts
// @access  Private/Admin
const createCart = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const cart = new Cart(data);
    const createdCart = await cart.save();
    res.status(201).json(createdCart); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a cart
// @route   PUT /api/carts/:id
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Cart.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedCart = await data.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error("Cart not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getCarts,
  getCartById,
  deleteCart,
  createCart,
  updateCart,
  getAllCarts,
};
