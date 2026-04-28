import asyncHandler from "express-async-handler";
import Blog from "./BlogModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
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
    const count = await Blog.countDocuments({ ...searchParams });
    const blogs = await Blog.find({ ...searchParams })
      .limit(pageSize)
      .populate("category", "_id, name")
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name")
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ blogs, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});
// @desc    Fetch all blogs
// @route   GET /api/blogs/all
// @access  Public
const getAllBlogs = asyncHandler(async (req, res) => {
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
    const blogs = await Blog.find({ ...searchParams })
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Fetch single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("category", "_id, name")
      .populate("created_by", "_id, name")
      .populate("updated_by", "_id, name");

    if (blog && blog.published_status === "PUBLISHED") {
      res.json(blog);
    } else {
      res.status(404);
      throw new Error("Blog not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      await blog.remove();
      res.json({ message: "Blog removed" });
    } else {
      res.status(404);
      throw new Error("Blog not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong");
  }
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({ slug: req.params.slug }).populate(
      "category"
    );

    if (blogs.length > 0) {
      res.json(blogs[0]);
    } else {
      res.status(502);
      throw new Error("No Blog Find");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went wrong");
  }
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const blog = new Blog(data);
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Blog.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedBlog = await data.save();
      res.json(updatedBlog);
    } else {
      res.status(404);
      throw new Error("Blog not found");
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error("Something Went Wrong.");
  }
});

export {
  getBlogs,
  getBlogById,
  deleteBlog,
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlogBySlug,
};
