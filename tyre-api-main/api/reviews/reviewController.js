import asyncHandler from 'express-async-handler';
import Review from './ReviewModel.js';
import checkRequired from '../../utils/checkRequired.js';
import Product from '../products/ProductModel.js';

// @desc    Fetch all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: 'i',
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
    const count = await Review.countDocuments({ ...searchParams });
    const reviews = await Review.find({ ...searchParams })
      .limit(pageSize)
      .populate('product')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      reviews,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});
// @desc    Fetch all reviews
// @route   GET /api/reviews/all
// @access  Public
const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams['published_status'] = 'PUBLISHED';
    if (req.query.term && req.query.value) {
      // searchParams[req.query.term] = req.query.value;
      searchParams[req.query.term] = {
        $regex: req.query.value,
        $options: 'i',
      };
    }
    const reviews = await Review.find({ ...searchParams })
      .populate('product')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('product')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (review && review.published_status === 'PUBLISHED') {
      res.json(review);
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      await review.remove();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private/Admin
const createReview = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    console.log('Product', data.product);

    // Check if product exists (if product is provided)
    if (data.product) {
      const product = await Product.findById(data.product);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
    }

    // Create and save the review
    const review = new Review(data);
    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await Review.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedReview = await data.save();
      res.json(updatedReview);
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getReviews,
  getReviewById,
  deleteReview,
  createReview,
  updateReview,
  getAllReviews,
};
