import asyncHandler from "express-async-handler";
import Testimonial from "./TestimonialModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = asyncHandler(async (req, res) => {
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
  const count = await Testimonial.countDocuments({ ...searchParams });
  const testimonials = await Testimonial.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ testimonials, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all testimonials
// @route   GET /api/testimonials/all
// @access  Public
const getAllTestimonials = asyncHandler(async (req, res) => {
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
  const testimonials = await Testimonial.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(testimonials);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
const getTestimonialById = asyncHandler(async (req, res) => {
  try {
  const testimonial = await Testimonial.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (testimonial && testimonial.published_status === "PUBLISHED") {
    res.json(testimonial);
  } else {
    res.status(404);
    throw new Error("Testimonial not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = asyncHandler(async (req, res) => {
  try {
  const testimonial = await Testimonial.findById(req.params.id);

  if (testimonial) {
    await testimonial.remove();
    res.json({ message: "Testimonial removed" });
  } else {
    res.status(404);
    throw new Error("Testimonial not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const testimonial = new Testimonial(data);
    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private
const updateTestimonial = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Testimonial.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedTestimonial = await data.save();
    res.json(updatedTestimonial);
  } else {
    res.status(404);
    throw new Error("Testimonial not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getTestimonials,
  getTestimonialById,
  deleteTestimonial,
  createTestimonial,
  updateTestimonial,
  getAllTestimonials,
};
