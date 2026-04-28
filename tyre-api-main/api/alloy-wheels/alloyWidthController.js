import asyncHandler from 'express-async-handler';
import AlloyWidth from './AlloyWidthModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyWidths = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyWidth.countDocuments({});
  const items = await AlloyWidth.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyWidths = asyncHandler(async (req, res) => {
  const items = await AlloyWidth.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyWidthById = asyncHandler(async (req, res) => {
  const item = await AlloyWidth.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy Width not found');
  }
  res.json(item);
});

const createAlloyWidth = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  // Normalize payload: prefer name + width_type; fallback to name + widthValue
  if (!data.width_type && typeof data.widthValue !== 'undefined') {
    data.width_type = String(data.widthValue);
  }
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyWidth.create(data);
  res.status(201).json(created);
});

const updateAlloyWidth = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (!feed.width_type && typeof feed.widthValue !== 'undefined') {
    feed.width_type = String(feed.widthValue);
  }
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyWidth.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Width not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyWidth = asyncHandler(async (req, res) => {
  const doc = await AlloyWidth.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Width not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy Width removed' });
});

export {
  getAlloyWidths,
  getAllAlloyWidths,
  getAlloyWidthById,
  createAlloyWidth,
  updateAlloyWidth,
  deleteAlloyWidth,
};
