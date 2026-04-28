import asyncHandler from "express-async-handler";
import Newsletter from "./NewsletterModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all newsletters
// @route   GET /api/newsletters
// @access  Public
const getNewsletters = asyncHandler(async (req, res) => {
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
    const count = await Newsletter.countDocuments({ ...searchParams });
    const newsletters = await Newsletter.find({ ...searchParams })
      .limit(pageSize)
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name")
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      newsletters,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});
// @desc    Fetch all newsletters
// @route   GET /api/newsletters/all
// @access  Public
const getAllNewsletters = asyncHandler(async (req, res) => {
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
    const newsletters = await Newsletter.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Fetch single newsletter
// @route   GET /api/newsletters/:id
// @access  Public
const getNewsletterById = asyncHandler(async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name");

    if (newsletter && newsletter.published_status === "PUBLISHED") {
      res.json(newsletter);
    } else {
      res.status(404);
      throw new Error("Newsletter not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Delete a newsletter
// @route   DELETE /api/newsletters/:id
// @access  Private/Admin
const deleteNewsletter = asyncHandler(async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (newsletter) {
      await newsletter.remove();
      res.json({ message: "Newsletter removed" });
    } else {
      res.status(404);
      throw new Error("Newsletter not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Create a newsletter
// @route   POST /api/newsletters
// @access  Private/Admin
const createNewsletter = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }

    const newsletter = new Newsletter(data);
    const createdNewsletter = await newsletter.save();
    res.status(201).json(createdNewsletter);
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }
});

// @desc    Update a newsletter
// @route   PUT /api/newsletters/:id
// @access  Private
const updateNewsletter = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);

    feed.updated_by = req.user._id;
    const data = await Newsletter.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedNewsletter = await data.save();
      res.json(updatedNewsletter);
    } else {
      res.status(404);
      throw new Error("Newsletter not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong.");
  }
});

export {
  getNewsletters,
  getNewsletterById,
  deleteNewsletter,
  createNewsletter,
  updateNewsletter,
  getAllNewsletters,
};
