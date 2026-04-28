import asyncHandler from 'express-async-handler';
import Notification from './NotificationModel.js';
import checkRequired from '../../utils/checkRequired.js';

// @desc    Fetch all notifications
// @route   GET /api/notifications
// @access  Public
const getNotifications = asyncHandler(async (req, res) => {
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
    const count = await Notification.countDocuments({ ...searchParams });
    const notifications = await Notification.find({ ...searchParams })
      .limit(pageSize)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      notifications,
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
// @desc    Fetch all notifications
// @route   GET /api/notifications/all
// @access  Public
const getAllNotifications = asyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};

    searchParams['is_read'] = false;
    if (req.user && req.user.role === 'VENDOR') {
      searchParams['user'] = req.user._id;
    }
    searchParams['is_read'] = false;

    const notifications = await Notification.find({ ...searchParams })
      .limit(10)
      .skip(100 * (page - 1))
      .sort({ createdAt: -1 });
    const count = await Notification.countDocuments({ ...searchParams });

    res.json({ notifications, count });
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went wrong');
  }
});

// @desc    Fetch single notification
// @route   GET /api/notifications/:id
// @access  Public
const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('created_by', '_id, name')
      .populate('updated_by', '_id, name');

    if (notification && notification.published_status === 'PUBLISHED') {
      res.json(notification);
    } else {
      res.status(404);
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      await notification.remove();
      res.json({ message: 'Notification removed' });
    } else {
      res.status(404);
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong');
  }
});

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    data.created_by = req.user._id;
    const notification = new Notification(data);
    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(502);
    throw new Error('Something Went Wrong. Please try again');
  }
});

// @desc    Update a notification
// @route   PUT /api/notifications/:id
// @access  Private
const updateNotification = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    feed.updated_by = req.user._id;
    const data = await Notification.findById(req.params.id);
    if (data) {
      Object.keys(feed).map((item, index) => {
        data[item] = feed[item];
      });
      const updatedNotification = await data.save();
      res.json(updatedNotification);
    } else {
      res.status(404);
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});

export {
  getNotifications,
  getNotificationById,
  deleteNotification,
  createNotification,
  updateNotification,
  getAllNotifications,
};
