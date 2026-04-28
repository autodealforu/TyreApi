import asyncHandler from "express-async-handler";
import Page from "./PageModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all pages
// @route   GET /api/pages
// @access  Public
const getPages = asyncHandler(async (req, res) => {
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
    const count = await Page.countDocuments({ ...searchParams });
    const pages = await Page.find({ ...searchParams })
      .limit(pageSize)
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name")
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      pages,
      page,
      pages_count: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});
// @desc    Fetch all pages
// @route   GET /api/pages/all
// @access  Public
const getAllPages = asyncHandler(async (req, res) => {
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
    const pages = await Page.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Fetch single page
// @route   GET /api/pages/:id
// @access  Public
const getPageById = asyncHandler(async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name");

    if (page && page.published_status === "PUBLISHED") {
      res.json(page);
    } else {
      res.status(404);
      throw new Error("Page not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
const deletePage = asyncHandler(async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (page) {
      await page.remove();
      res.json({ message: "Page removed" });
    } else {
      res.status(404);
      throw new Error("Page not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Create a page
// @route   POST /api/pages
// @access  Private/Admin
const createPage = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const page = new Page(data);
    const createdPage = await page.save();
    res.status(201).json(createdPage);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }
});

// @desc    Update a page
// @route   PUT /api/pages/:id
// @access  Private
const updatePage = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Page.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedPage = await data.save();
      res.json(updatedPage);
    } else {
      res.status(404);
      throw new Error("Page not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong.");
  }
});

export {
  getPages,
  getPageById,
  deletePage,
  createPage,
  updatePage,
  getAllPages,
};
