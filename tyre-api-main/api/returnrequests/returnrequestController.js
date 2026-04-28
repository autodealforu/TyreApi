import asyncHandler from "express-async-handler";
import Returnrequest from "./ReturnrequestModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all returnrequests
// @route   GET /api/returnrequests
// @access  Public
const getReturnrequests = asyncHandler(async (req, res) => {
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
  const count = await Returnrequest.countDocuments({ ...searchParams });
  const returnrequests = await Returnrequest.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ returnrequests, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all returnrequests
// @route   GET /api/returnrequests/all
// @access  Public
const getAllReturnrequests = asyncHandler(async (req, res) => {
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
  const returnrequests = await Returnrequest.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(returnrequests);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single returnrequest
// @route   GET /api/returnrequests/:id
// @access  Public
const getReturnrequestById = asyncHandler(async (req, res) => {
  try {
  const returnrequest = await Returnrequest.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (returnrequest && returnrequest.published_status === "PUBLISHED") {
    res.json(returnrequest);
  } else {
    res.status(404);
    throw new Error("Returnrequest not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a returnrequest
// @route   DELETE /api/returnrequests/:id
// @access  Private/Admin
const deleteReturnrequest = asyncHandler(async (req, res) => {
  try {
  const returnrequest = await Returnrequest.findById(req.params.id);

  if (returnrequest) {
    await returnrequest.remove();
    res.json({ message: "Returnrequest removed" });
  } else {
    res.status(404);
    throw new Error("Returnrequest not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a returnrequest
// @route   POST /api/returnrequests
// @access  Private/Admin
const createReturnrequest = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const returnrequest = new Returnrequest(data);
    const createdReturnrequest = await returnrequest.save();
    res.status(201).json(createdReturnrequest); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a returnrequest
// @route   PUT /api/returnrequests/:id
// @access  Private
const updateReturnrequest = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Returnrequest.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedReturnrequest = await data.save();
    res.json(updatedReturnrequest);
  } else {
    res.status(404);
    throw new Error("Returnrequest not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getReturnrequests,
  getReturnrequestById,
  deleteReturnrequest,
  createReturnrequest,
  updateReturnrequest,
  getAllReturnrequests,
};
