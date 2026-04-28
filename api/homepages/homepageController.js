import asyncHandler from 'express-async-handler';
import Homepage from './HomepageModel.js';
import checkRequired from '../../utils/checkRequired.js';
import { getTotalProductsByHomepage } from './homepageService.js';

// @desc    Fetch all homepages
// @route   GET /api/homepages
// @access  Public
const getHomepages = asyncHandler(async (req, res) => {
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
    const count = await Homepage.countDocuments({ ...searchParams });
    const homepages = await Homepage.find(
      { ...searchParams },
      {},
      { lean: true }
    )
      .limit(pageSize)
      .populate('template')
      .populate('collections_component.product_collections')
      .populate('collection_product_component.product_collection')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ position: 1 });
    console.log('Homepages', homepages);

    let newHomepageToShow = [];
    const getWithPromiseAll = async () => {
      const promises = homepages.map(async (item) => {
        const homepageNew = await getTotalProductsByHomepage({
          homepage: item,
        });
        newHomepageToShow.push(homepageNew);
      });
      await Promise.all(promises);
    };

    await getWithPromiseAll();
    console.log('newHomepageToShow', newHomepageToShow);
    const sortedHomepage = newHomepageToShow.sort(function (x, y) {
      return x.position - y.position;
    });
    res.json({
      homepages,
      homepageNew: sortedHomepage,
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
// @desc    Fetch all homepages
// @route   GET /api/homepages/all
// @access  Public
const getAllHomepages = asyncHandler(async (req, res) => {
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
    const homepages = await Homepage.find({ ...searchParams })
      .populate('template')
      .populate('collections_component.product_collections')
      .populate('collection_product_component.product_collection')
      .limit(100)
      .skip(100 * (page - 1))
      .sort({ position: 1 });
    res.json(homepages);
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single homepage
// @route   GET /api/homepages/:id
// @access  Public
const getHomepageById = asyncHandler(async (req, res) => {
  try {
    console.log('ID TO CHECK', req.params.id);
    const homepage = await Homepage.findOne({ _id: req.params.id })
      .populate('template')
      .populate('collections_component.product_collections')
      .populate('collection_product_component.product_collection')
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');
    console.log('Homepage', homepage);
    if (homepage && homepage.published_status === 'PUBLISHED') {
      res.json(homepage);
    } else {
      res.status(404);
      throw new Error('Homepage not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a homepage
// @route   DELETE /api/homepages/:id
// @access  Private/Admin
const deleteHomepage = asyncHandler(async (req, res) => {
  try {
    const homepage = await Homepage.findById(req.params.id);

    if (homepage) {
      await homepage.remove();
      res.json({ message: 'Homepage removed' });
    } else {
      res.status(404);
      throw new Error('Homepage not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a homepage
// @route   POST /api/homepages
// @access  Private/Admin
const createHomepage = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if (req.user) {
      data.created_by = req.user._id;
    }
    const homepage = new Homepage(data);
    const createdHomepage = await homepage.save();
    res.status(201).json(createdHomepage);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a homepage
// @route   PUT /api/homepages/:id
// @access  Private
const updateHomepage = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if (req.user) {
      feed.updated_by = req.user._id;
    }

    const data = await Homepage.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedHomepage = await data.save();
      res.json(updatedHomepage);
    } else {
      res.status(404);
      throw new Error('Homepage not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getHomepages,
  getHomepageById,
  deleteHomepage,
  createHomepage,
  updateHomepage,
  getAllHomepages,
};
