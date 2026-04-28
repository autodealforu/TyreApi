import asyncHandler from 'express-async-handler';
import Banner from './BannerModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
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
    const count = await Banner.countDocuments({ ...searchParams });
    const banners = await Banner.find({ ...searchParams })
      .limit(pageSize)
      .populate('product_collection', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      banners,
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
// @desc    Fetch all banners
// @route   GET /api/banners/all
// @access  Public
const getAllBanners = asyncHandler(async (req, res) => {
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
    const banners = await Banner.find({ ...searchParams })
      .populate('product_collection')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single banner
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('product_collection', '_id, name')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (banner && banner.published_status === 'PUBLISHED') {
      res.json(banner);
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      await banner.remove();
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const banner = new Banner(data);
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private
const updateBanner = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Banner.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedBanner = await data.save();
      res.json(updatedBanner);
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getBanners,
  getBannerById,
  deleteBanner,
  createBanner,
  updateBanner,
  getAllBanners,
};
