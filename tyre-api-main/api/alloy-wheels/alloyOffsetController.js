import asyncHandler from 'express-async-handler';
import AlloyOffset from './AlloyOffsetModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyOffsets = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyOffset.countDocuments({});
  const items = await AlloyOffset.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyOffsets = asyncHandler(async (req, res) => {
  const items = await AlloyOffset.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyOffsetById = asyncHandler(async (req, res) => {
  const item = await AlloyOffset.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy Offset not found');
  }
  res.json(item);
});

const createAlloyOffset = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  data.name = (data.name || '').trim();
  delete data.offsetValue;
  delete data.unit;
  delete data.offsetType;
  delete data.description;
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyOffset.create(data);
  res.status(201).json(created);
});

const updateAlloyOffset = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (feed.name) feed.name = feed.name.trim();
  delete feed.offsetValue;
  delete feed.unit;
  delete feed.offsetType;
  delete feed.description;
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyOffset.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Offset not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyOffset = asyncHandler(async (req, res) => {
  const doc = await AlloyOffset.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Offset not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy Offset removed' });
});

export {
  getAlloyOffsets,
  getAllAlloyOffsets,
  getAlloyOffsetById,
  createAlloyOffset,
  updateAlloyOffset,
  deleteAlloyOffset,
};
