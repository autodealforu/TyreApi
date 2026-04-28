import asyncHandler from "express-async-handler";
import Template from "./TemplateModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all templates
// @route   GET /api/templates
// @access  Public
const getTemplates = asyncHandler(async (req, res) => {
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
  const count = await Template.countDocuments({ ...searchParams });
  const templates = await Template.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ templates, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all templates
// @route   GET /api/templates/all
// @access  Public
const getAllTemplates = asyncHandler(async (req, res) => {
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
  const templates = await Template.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(templates);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single template
// @route   GET /api/templates/:id
// @access  Public
const getTemplateById = asyncHandler(async (req, res) => {
  try {
  const template = await Template.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (template && template.published_status === "PUBLISHED") {
    res.json(template);
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
const deleteTemplate = asyncHandler(async (req, res) => {
  try {
  const template = await Template.findById(req.params.id);

  if (template) {
    await template.remove();
    res.json({ message: "Template removed" });
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a template
// @route   POST /api/templates
// @access  Private/Admin
const createTemplate = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const template = new Template(data);
    const createdTemplate = await template.save();
    res.status(201).json(createdTemplate); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a template
// @route   PUT /api/templates/:id
// @access  Private
const updateTemplate = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Template.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedTemplate = await data.save();
    res.json(updatedTemplate);
  } else {
    res.status(404);
    throw new Error("Template not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getTemplates,
  getTemplateById,
  deleteTemplate,
  createTemplate,
  updateTemplate,
  getAllTemplates,
};
